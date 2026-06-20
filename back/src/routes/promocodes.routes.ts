import { Router } from "express";
import type { Request, Response } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { userPromocodes, promocodes } from "../db/schema.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /promocodes/my:
 *   get:
 *     summary: Получить мои промокоды
 *     tags: [Promocodes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/my", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    console.log(`📥 Запрос промокодов пользователя ${userId}`);

    // Получаем промокоды пользователя
    const myPromocodes = await db
      .select({
        id: userPromocodes.id,
        code: promocodes.code,
        discount: promocodes.discount,
        discountType: promocodes.discountType,
        description: promocodes.description,
        createdAt: userPromocodes.grantedAt,
        expiresAt: userPromocodes.expiresAt,
        usedAt: userPromocodes.usedAt,
        status: userPromocodes.status,
        source: userPromocodes.source,
      })
      .from(userPromocodes)
      .innerJoin(promocodes, eq(userPromocodes.promocodeId, promocodes.id))
      .where(eq(userPromocodes.userId, userId))
      .orderBy(desc(userPromocodes.grantedAt));

    console.log(`✅ Найдено ${myPromocodes.length} промокодов`);

    // Маппим в UI формат
    const mapped = myPromocodes.map((p) => ({
      id: p.id,
      code: p.code,
      discount: p.discount,
      type: p.discountType as "percent" | "fixed",
      status: p.status as "active" | "expired" | "used",
      createdAt: p.createdAt.toISOString(),
      expiresAt: p.expiresAt.toISOString(),
      description: p.description || "",
      used: p.status === "used",
    }));

    res.json({
      promocodes: mapped,
      total: mapped.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching promocodes:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /promocodes/validate:
 *   post:
 *     summary: Проверить промокод
 *     tags: [Promocodes]
 */
router.post("/validate", async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Код обязателен" });
    }

    const promo = await db.query.promocodes.findFirst({
      where: eq(promocodes.code, code.toUpperCase()),
    });

    if (!promo) {
      return res.status(404).json({ error: "Промокод не найден" });
    }

    // Проверка срока действия
    const now = new Date();
    if (promo.validUntil < now) {
      return res.status(400).json({ error: "Промокод истёк" });
    }

    if (promo.status !== "active") {
      return res.status(400).json({ error: "Промокод не активен" });
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ error: "Промокод больше не доступен" });
    }

    res.json({
      id: promo.id,
      code: promo.code,
      discount: promo.discount,
      discountType: promo.discountType,
      description: promo.description,
      expiresAt: promo.validUntil.toISOString(),
    });
  } catch (error: any) {
    console.error("Error validating promocode:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /promocodes/apply:
 *   post:
 *     summary: Применить промокод к бронированию
 *     tags: [Promocodes]
 *     security:
 *       - bearerAuth: []
 */
router.post("/apply", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { code, bookingId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Не авторизован" });
    }

    if (!code) {
      return res.status(400).json({ error: "Код обязателен" });
    }

    // Находим промокод
    const promo = await db.query.promocodes.findFirst({
      where: eq(promocodes.code, code.toUpperCase()),
    });

    if (!promo) {
      return res.status(404).json({ error: "Промокод не найден" });
    }

    // Проверки
    const now = new Date();
    if (promo.validUntil < now) {
      return res.status(400).json({ error: "Промокод истёк" });
    }

    if (promo.status !== "active") {
      return res.status(400).json({ error: "Промокод не активен" });
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ error: "Промокод больше не доступен" });
    }

    // Проверяем что пользователь уже не использовал этот промокод
    const existingUsage = await db.query.userPromocodes.findFirst({
      where: and(
        eq(userPromocodes.userId, userId),
        eq(userPromocodes.promocodeId, promo.id),
      ),
    });

    if (existingUsage && existingUsage.status === "used") {
      return res.status(400).json({ error: "Промокод уже использован" });
    }

    // Если промокод ещё не был у пользователя — создаём запись
    if (!existingUsage) {
      await db.insert(userPromocodes).values({
        userId,
        promocodeId: promo.id,
        status: "used",
        usedAt: now,
        bookingId: bookingId || null,
        source: "manual",
        expiresAt: promo.validUntil,
      });
    } else {
      // Обновляем существующую запись
      await db
        .update(userPromocodes)
        .set({
          status: "used",
          usedAt: now,
          bookingId: bookingId || null,
        })
        .where(eq(userPromocodes.id, existingUsage.id));
    }

    // Обновляем счётчик использований
    await db
      .update(promocodes)
      .set({ usedCount: sql`${promocodes.usedCount} + 1` })
      .where(eq(promocodes.id, promo.id));

    console.log(`✅ Промокод ${code} применён пользователем ${userId}`);

    res.json({
      message: "Промокод применён",
      discount: promo.discount,
      discountType: promo.discountType,
    });
  } catch (error: any) {
    console.error("Error applying promocode:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
