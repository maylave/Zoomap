import { eq, desc, asc, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { tickerItems, zones } from "../db/schema.js";

// ==================== ТИПЫ ====================

export interface CreateTickerItemInput {
  zoneId?: number;
  text: string;
  icon?: string;
  link?: string;
  displayOrder?: number;
  isActive?: boolean;
  speed?: number;
}

export interface UpdateTickerItemInput {
  zoneId?: number;
  text?: string;
  icon?: string;
  link?: string;
  displayOrder?: number;
  isActive?: boolean;
  speed?: number;
}

// ==================== ПОЛУЧИТЬ ВСЕ ЭЛЕМЕНТЫ ====================

export async function getAllTickerItems(query: any) {
  const { activeOnly = false } = query;

  const whereConditions: any[] = [];

  if (activeOnly === "true") {
    whereConditions.push(eq(tickerItems.isActive, true));
  }

  const itemsList = await db.query.tickerItems.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    with: {
      zone: {
        columns: { id: true, name: true },
      },
    },
    orderBy: [asc(tickerItems.displayOrder), desc(tickerItems.createdAt)],
  });

  return {
    items: itemsList,
    total: itemsList.length,
  };
}

// ==================== ПОЛУЧИТЬ ЭЛЕМЕНТ ПО ID ====================

export async function getTickerItemById(id: number) {
  const item = await db.query.tickerItems.findFirst({
    where: eq(tickerItems.id, id),
    with: {
      zone: {
        columns: { id: true, name: true },
      },
    },
  });

  if (!item) {
    const error = new Error("Элемент не найден");
    (error as any).statusCode = 404;
    throw error;
  }

  return item;
}

// ==================== СОЗДАТЬ ЭЛЕМЕНТ ====================

export async function createTickerItem(input: CreateTickerItemInput) {
  const { text, zoneId, icon, link, displayOrder, isActive, speed } = input;

  if (!text) {
    const error = new Error("Текст обязателен");
    (error as any).statusCode = 400;
    throw error;
  }

  const result = await db
    .insert(tickerItems)
    .values({
      text,
      zoneId: zoneId || null,
      icon: icon || null,
      link: link || null,
      displayOrder: displayOrder ?? 0,
      isActive: isActive ?? true,
      speed: speed ?? 30,
    })
    .returning();

  return result[0];
}

// ==================== ОБНОВИТЬ ЭЛЕМЕНТ ====================

export async function updateTickerItem(
  id: number,
  input: UpdateTickerItemInput,
) {
  const existing = await db.query.tickerItems.findFirst({
    where: eq(tickerItems.id, id),
  });

  if (!existing) {
    const error = new Error("Элемент не найден");
    (error as any).statusCode = 404;
    throw error;
  }

  const updateData: any = {};

  if (input.text !== undefined) updateData.text = input.text;
  if (input.zoneId !== undefined) updateData.zoneId = input.zoneId;
  if (input.icon !== undefined) updateData.icon = input.icon;
  if (input.link !== undefined) updateData.link = input.link;
  if (input.displayOrder !== undefined)
    updateData.displayOrder = input.displayOrder;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.speed !== undefined) updateData.speed = input.speed;

  const result = await db
    .update(tickerItems)
    .set(updateData)
    .where(eq(tickerItems.id, id))
    .returning();

  return result[0];
}

// ==================== УДАЛИТЬ ЭЛЕМЕНТ ====================

export async function deleteTickerItem(id: number) {
  const item = await db.query.tickerItems.findFirst({
    where: eq(tickerItems.id, id),
  });

  if (!item) {
    const error = new Error("Элемент не найден");
    (error as any).statusCode = 404;
    throw error;
  }

  await db.delete(tickerItems).where(eq(tickerItems.id, id));

  return { message: "Элемент удалён" };
}

// ==================== МАССИНГ ДЛЯ UI ====================

export function mapTickerItemToUI(item: any) {
  return {
    id: item.id,
    text: item.text,
    zoneId: item.zoneId,
    zoneName: item.zone?.name || null,
    icon: item.icon,
    link: item.link,
    displayOrder: item.displayOrder,
    isActive: item.isActive,
    speed: item.speed,
  };
}
