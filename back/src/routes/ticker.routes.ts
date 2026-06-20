import { Router } from "express";
import type { Request, Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { tickerItems } from "../db/schema.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ==================== ПОЛУЧИТЬ ВСЕ ЭЛЕМЕНТЫ ====================

/**
 * @swagger
 * /ticker:
 *   get:
 *     summary: Получить все элементы бегущей строки
 *     tags: [Ticker]
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const items = await db.query.tickerItems.findMany({
      orderBy: [desc(tickerItems.displayOrder), desc(tickerItems.createdAt)],
    });

    res.json({
      items,
      total: items.length,
    });
  } catch (error: any) {
    console.error("Error fetching ticker items:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== СОЗДАТЬ ЭЛЕМЕНТ ====================

/**
 * @swagger
 * /ticker:
 *   post:
 *     summary: Создать элемент бегущей строки (админ)
 *     tags: [Ticker]
 *     security:
 *       - bearerAuth: []
 */
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const { text, icon, displayOrder, isActive, speed, zoneId } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Текст обязателен" });
    }

    const result = await db
      .insert(tickerItems)
      .values({
        text,
        icon: icon || null,
        displayOrder: displayOrder || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        speed: speed || 30,
        zoneId: zoneId || null,
      })
      .returning();

    res.status(201).json(result[0]);
  } catch (error: any) {
    console.error("Error creating ticker item:", error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== ОБНОВИТЬ ЭЛЕМЕНТ ====================

/**
 * @swagger
 * /ticker/{id}:
 *   put:
 *     summary: Обновить элемент бегущей строки (админ)
 *     tags: [Ticker]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const id = Number(req.params.id);
    const { text, icon, displayOrder, isActive, speed, zoneId } = req.body;

    const existing = await db.query.tickerItems.findFirst({
      where: eq(tickerItems.id, id),
    });

    if (!existing) {
      return res.status(404).json({ error: "Элемент не найден" });
    }

    const updateData: any = {};

    if (text !== undefined) updateData.text = text;
    if (icon !== undefined) updateData.icon = icon;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (speed !== undefined) updateData.speed = speed;
    if (zoneId !== undefined) updateData.zoneId = zoneId;

    const result = await db
      .update(tickerItems)
      .set(updateData)
      .where(eq(tickerItems.id, id))
      .returning();

    res.json(result[0]);
  } catch (error: any) {
    console.error("Error updating ticker item:", error);
    res.status(400).json({ error: error.message });
  }
});

// ==================== УДАЛИТЬ ЭЛЕМЕНТ ====================

/**
 * @swagger
 * /ticker/{id}:
 *   delete:
 *     summary: Удалить элемент бегущей строки (админ)
 *     tags: [Ticker]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const id = Number(req.params.id);

    const existing = await db.query.tickerItems.findFirst({
      where: eq(tickerItems.id, id),
    });

    if (!existing) {
      return res.status(404).json({ error: "Элемент не найден" });
    }

    await db.delete(tickerItems).where(eq(tickerItems.id, id));

    res.json({ message: "Элемент удалён" });
  } catch (error: any) {
    console.error("Error deleting ticker item:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
