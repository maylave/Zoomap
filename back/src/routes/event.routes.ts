import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { events } from "../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ==================== МАППИНГ В UI ФОРМАТ ====================

const categoryColors: Record<string, { bg: string; text: string }> = {
  Кормление: { bg: "bg-accent", text: "text-accent" },
  "Ночной тур": { bg: "bg-warning", text: "text-warning" },
  "Мастер-класс": { bg: "bg-success", text: "text-success" },
  Экскурсия: { bg: "bg-info", text: "text-info" },
  Праздник: { bg: "bg-terracotta", text: "text-terracotta" },
};

function mapEventToUI(event: any) {
  const categoryColor = categoryColors[event.category] || {
    bg: "bg-accent",
    text: "text-accent",
  };

  return {
    id: event.id,
    day: String(event.day),
    month: event.month,
    icon: event.icon || "calendar",
    category: event.category,
    title: event.title,
    description: event.description || "",
    price: event.price,
    priceLabel: event.priceLabel || "",
    button: event.buttonText,
    location: event.location,
    date: event.date,
    dateBg: categoryColor.bg,
    categoryColor: categoryColor.text,
    creator: event.creator,
  };
}

// ==================== ПУБЛИЧНЫЕ РОУТЫ ====================

// Получить все события
router.get("/", async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0, category } = req.query;

    const whereConditions: any[] = [];

    if (category) {
      whereConditions.push(eq(events.category, String(category)));
    }

    const eventsList = await db.query.events.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        creator: {
          columns: { id: true, name: true, email: true },
        },
      },
      orderBy: [desc(events.date)],
      limit: Number(limit),
      offset: Number(offset),
    });

    // ✅ Маппим в UI формат
    const mappedEvents = eventsList.map(mapEventToUI);

    // ✅ Возвращаем объект, а не массив
    res.json({
      events: mappedEvents,
      total: mappedEvents.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Получить событие по ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const event = await db.query.events.findFirst({
      where: eq(events.id, Number(req.params.id)),
      with: {
        creator: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: "Событие не найдено" });
    }

    res.json(mapEventToUI(event));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== АДМИН РОУТЫ ====================

// Создать событие
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const {
      title,
      description,
      date,
      day,
      month,
      icon,
      category,
      price,
      priceLabel,
      buttonText,
      location,
    } = req.body;

    // Валидация
    if (
      !title ||
      !date ||
      !day ||
      !month ||
      !category ||
      !price ||
      !buttonText ||
      !location
    ) {
      return res
        .status(400)
        .json({ error: "Все обязательные поля должны быть заполнены" });
    }

    const result = await db
      .insert(events)
      .values({
        title,
        description: description || null,
        date: new Date(date),
        day: Number(day),
        month,
        icon: icon || null,
        category,
        price,
        priceLabel: priceLabel || null,
        buttonText,
        location,
        createdBy: req.user!.userId,
      })
      .returning();

    res.status(201).json(mapEventToUI(result[0]));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Обновить событие
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const id = Number(req.params.id);
    const {
      title,
      description,
      date,
      day,
      month,
      icon,
      category,
      price,
      priceLabel,
      buttonText,
      location,
    } = req.body;

    const existingEvent = await db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!existingEvent) {
      return res.status(404).json({ error: "Событие не найдено" });
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (day !== undefined) updateData.day = Number(day);
    if (month !== undefined) updateData.month = month;
    if (icon !== undefined) updateData.icon = icon;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (priceLabel !== undefined) updateData.priceLabel = priceLabel;
    if (buttonText !== undefined) updateData.buttonText = buttonText;
    if (location !== undefined) updateData.location = location;

    const result = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    res.json(mapEventToUI(result[0]));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Удалить событие
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const id = Number(req.params.id);

    const event = await db.query.events.findFirst({
      where: eq(events.id, id),
    });

    if (!event) {
      return res.status(404).json({ error: "Событие не найдено" });
    }

    await db.delete(events).where(eq(events.id, id));

    res.json({ message: "Событие удалено" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
