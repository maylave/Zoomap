import { Router } from "express";
import type { Request, Response } from "express";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { db } from "../db/index.js";
import { promocodes, userPromocodes, users } from "../db/schema.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ==================== ГЕНЕРАЦИЯ ПРОМОКОДА ====================

function generatePromoCode(prefix: string = "ZOO"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = prefix + "-";
  for (let i = 0; i < 3; i++) {
    if (i > 0) code += "-";
    for (let j = 0; j < 4; j++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return code;
}

// ==================== МАССОВАЯ ГЕНЕРАЦИЯ ====================

/**
 * @swagger
 * /admin/promocodes/generate:
 *   post:
 *     summary: Массовая генерация промокодов (админ)
 *     tags: [Admin/Promocodes]
 *     security:
 *       - bearerAuth: []
 */
router.post("/generate", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const {
      quantity = 1,
      discount,
      discountType,
      description,
      usageLimit,
      validFrom,
      validUntil,
      minOrderAmount,
      prefix = "ZOO",
    } = req.body;

    // Валидация
    if (!discount || !discountType) {
      return res.status(400).json({ error: "Укажите скидку и тип скидки" });
    }

    if (!["percent", "fixed"].includes(discountType)) {
      return res.status(400).json({ error: "Недопустимый тип скидки" });
    }

    if (discountType === "percent" && (discount < 1 || discount > 100)) {
      return res.status(400).json({ error: "Процент должен быть от 1 до 100" });
    }

    if (quantity < 1 || quantity > 100) {
      return res.status(400).json({ error: "Количество от 1 до 100" });
    }

    const validFromDate = validFrom ? new Date(validFrom) : new Date();
    const validUntilDate = validUntil
      ? new Date(validUntil)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней по умолчанию

    const createdPromos = [];

    for (let i = 0; i < quantity; i++) {
      let code = generatePromoCode(prefix);

      // Проверяем уникальность
      let attempts = 0;
      while (attempts < 10) {
        const existing = await db.query.promocodes.findFirst({
          where: eq(promocodes.code, code),
        });
        if (!existing) break;
        code = generatePromoCode(prefix);
        attempts++;
      }

      const result = await db
        .insert(promocodes)
        .values({
          code,
          discount,
          discountType: discountType as "percent" | "fixed",
          description:
            description ||
            `Скидка ${discount}${discountType === "percent" ? "%" : "₽"}`,
          status: "active",
          usageLimit: usageLimit || null,
          usedCount: 0,
          validFrom: validFromDate,
          validUntil: validUntilDate,
          minOrderAmount: minOrderAmount || null,
          createdBy: req.user!.userId,
        })
        .returning();

      createdPromos.push(result[0]);
    }

    console.log(`✅ Создано ${createdPromos.length} промокодов`);

    res.status(201).json({
      promocodes: createdPromos,
      total: createdPromos.length,
    });
  } catch (error: any) {
    console.error("Error generating promocodes:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ВЫДАЧА ПРОМОКОДА ПОЛЬЗОВАТЕЛЮ ====================

/**
 * @swagger
 * /admin/promocodes/grant:
 *   post:
 *     summary: Выдать промокод пользователю (админ)
 *     tags: [Admin/Promocodes]
 *     security:
 *       - bearerAuth: []
 */
router.post("/grant", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const { promocodeId, userId, expiresDays = 30 } = req.body;

    if (!promocodeId || !userId) {
      return res.status(400).json({ error: "Укажите промокод и пользователя" });
    }

    // Проверяем промокод
    const promo = await db.query.promocodes.findFirst({
      where: eq(promocodes.id, promocodeId),
    });

    if (!promo) {
      return res.status(404).json({ error: "Промокод не найден" });
    }

    if (promo.status !== "active") {
      return res.status(400).json({ error: "Промокод не активен" });
    }

    // Проверяем пользователя
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Проверяем что у пользователя ещё нет этого промокода
    const existing = await db.query.userPromocodes.findFirst({
      where: and(
        eq(userPromocodes.userId, userId),
        eq(userPromocodes.promocodeId, promocodeId),
      ),
    });

    if (existing) {
      return res
        .status(400)
        .json({ error: "У пользователя уже есть этот промокод" });
    }

    // Выдаём промокод
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    const result = await db
      .insert(userPromocodes)
      .values({
        userId,
        promocodeId,
        status: "available",
        source: "manual",
        expiresAt,
      })
      .returning();

    res.status(201).json({
      message: "Промокод выдан",
      userPromocode: result[0],
    });
  } catch (error: any) {
    console.error("Error granting promocode:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ВЫДАЧА ВСЕМ ПОЛЬЗОВАТЕЛЯМ ====================

/**
 * @swagger
 * /admin/promocodes/grant-all:
 *   post:
 *     summary: Выдать промокод всем пользователям (админ)
 *     tags: [Admin/Promocodes]
 *     security:
 *       - bearerAuth: []
 */
router.post("/grant-all", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const { promocodeId, expiresDays = 30 } = req.body;

    if (!promocodeId) {
      return res.status(400).json({ error: "Укажите промокод" });
    }

    const promo = await db.query.promocodes.findFirst({
      where: eq(promocodes.id, promocodeId),
    });

    if (!promo) {
      return res.status(404).json({ error: "Промокод не найден" });
    }

    // Получаем всех пользователей
    const allUsers = await db.query.users.findMany();

    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);

    let granted = 0;
    let skipped = 0;

    for (const user of allUsers) {
      // Проверяем что у пользователя ещё нет этого промокода
      const existing = await db.query.userPromocodes.findFirst({
        where: and(
          eq(userPromocodes.userId, user.id),
          eq(userPromocodes.promocodeId, promocodeId),
        ),
      });

      if (existing) {
        skipped++;
        continue;
      }

      await db.insert(userPromocodes).values({
        userId: user.id,
        promocodeId,
        status: "available",
        source: "manual",
        expiresAt,
      });

      granted++;
    }

    res.json({
      message: `Промокод выдан ${granted} пользователям (${skipped} уже имели)`,
      granted,
      skipped,
    });
  } catch (error: any) {
    console.error("Error granting promocode to all:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== СПИСОК ВСЕХ ПРОМОКОДОВ (АДМИН) ====================

/**
 * @swagger
 * /admin/promocodes:
 *   get:
 *     summary: Получить все промокоды (админ)
 *     tags: [Admin/Promocodes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const allPromos = await db.query.promocodes.findMany({
      orderBy: [desc(promocodes.createdAt)],
    });

    // Для каждого промокода считаем сколько раз выдан
    const promosWithStats = await Promise.all(
      allPromos.map(async (promo) => {
        const usageStats = await db
          .select({ count: count() })
          .from(userPromocodes)
          .where(eq(userPromocodes.promocodeId, promo.id));

        return {
          ...promo,
          grantedCount: usageStats[0]?.count || 0,
        };
      }),
    );

    res.json({
      promocodes: promosWithStats,
      total: promosWithStats.length,
    });
  } catch (error: any) {
    console.error("Error fetching promocodes:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== СТАТИСТИКА ====================

/**
 * @swagger
 * /admin/promocodes/stats:
 *   get:
 *     summary: Статистика промокодов (админ)
 *     tags: [Admin/Promocodes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/stats", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const totalPromos = await db.select({ count: count() }).from(promocodes);

    const activePromos = await db
      .select({ count: count() })
      .from(promocodes)
      .where(eq(promocodes.status, "active"));

    const totalUsage = await db.select({ count: count() }).from(userPromocodes);

    const usedPromos = await db
      .select({ count: count() })
      .from(userPromocodes)
      .where(eq(userPromocodes.status, "used"));

    res.json({
      total: totalPromos[0]?.count || 0,
      active: activePromos[0]?.count || 0,
      totalUsage: totalUsage[0]?.count || 0,
      used: usedPromos[0]?.count || 0,
    });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== УДАЛЕНИЕ ПРОМОКОДА ====================

/**
 * @swagger
 * /admin/promocodes/{id}:
 *   delete:
 *     summary: Удалить промокод (админ)
 *     tags: [Admin/Promocodes]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const id = Number(req.params.id);

    const promo = await db.query.promocodes.findFirst({
      where: eq(promocodes.id, id),
    });

    if (!promo) {
      return res.status(404).json({ error: "Промокод не найден" });
    }

    // Удаляем все связи с пользователями
    await db.delete(userPromocodes).where(eq(userPromocodes.promocodeId, id));

    // Удаляем сам промокод
    await db.delete(promocodes).where(eq(promocodes.id, id));

    res.json({ message: "Промокод удалён" });
  } catch (error: any) {
    console.error("Error deleting promocode:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
