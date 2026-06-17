import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import {
  zooTicketTypes,
  workingHours,
  ticketBookings,
  bookingTickets,
  promocodes,
  userPromocodes,
} from "../db/schema.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ==================== ТИПЫ ====================

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

// ==================== ПУБЛИЧНЫЕ РОУТЫ ====================

/**
 * @swagger
 * /tickets/types:
 *   get:
 *     summary: Получить все активные типы билетов
 *     tags: [Tickets]
 */
router.get("/types", async (req: Request, res: Response) => {
  try {
    const tickets = await db
      .select()
      .from(zooTicketTypes)
      .where(eq(zooTicketTypes.isActive, true))
      .orderBy(zooTicketTypes.price);

    res.json(tickets);
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Ошибка загрузки билетов" });
  }
});

/**
 * @swagger
 * /tickets/schedule:
 *   get:
 *     summary: Получить расписание работы
 *     tags: [Tickets]
 */
router.get("/schedule", async (req: Request, res: Response) => {
  try {
    const schedule = await db
      .select()
      .from(workingHours)
      .where(eq(workingHours.isActive, true));

    res.json(schedule);
  } catch (error: any) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ error: "Ошибка загрузки расписания" });
  }
});

/**
 * @swagger
 * /tickets/schedule/{date}/slots:
 *   get:
 *     summary: Получить доступные временные слоты
 *     tags: [Tickets]
 */
router.get("/schedule/:date/slots", async (req: Request, res: Response) => {
  try {
    const date = req.params.date as string;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Неверный формат даты" });
    }

    // Получаем существующие бронирования на эту дату
    const existingBookings = await db
      .select({ visitTime: ticketBookings.visitTime })
      .from(ticketBookings)
      .where(
        and(
          eq(ticketBookings.visitDate, date),
          eq(ticketBookings.status, "paid"),
        ),
      );

    const bookedTimes = new Set(existingBookings.map((b) => b.visitTime));

    // Генерируем слоты с 9:00 до 20:00
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      const time = `${hour.toString().padStart(2, "0")}:00`;
      slots.push({
        time,
        available: !bookedTimes.has(time),
      });
    }

    res.json(slots);
  } catch (error: any) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({ error: "Ошибка загрузки времени" });
  }
});

/**
 * @swagger
 * /tickets/validate-promo:
 *   post:
 *     summary: Проверить промокод
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/validate-promo",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { code } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "Требуется авторизация" });
      }

      if (!code) {
        return res.status(400).json({ error: "Код не указан" });
      }

      // Ищем промокод у пользователя
      const userPromo = await db.query.userPromocodes.findFirst({
        where: and(
          eq(userPromocodes.userId, userId),
          eq(userPromocodes.status, "available"),
        ),
        with: {
          promocode: true,
        },
      });

      if (!userPromo || !userPromo.promocode) {
        return res.status(404).json({ error: "Промокод не найден" });
      }

      const promo = userPromo.promocode;
      const now = new Date();

      // Проверка срока действия
      if (new Date(promo.validUntil) < now) {
        return res.status(400).json({ error: "Промокод истёк" });
      }

      if (new Date(promo.validFrom) > now) {
        return res.status(400).json({ error: "Промокод ещё не активен" });
      }

      // Проверка лимита использований
      if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
        return res.status(400).json({ error: "Лимит использований исчерпан" });
      }

      res.json({
        id: userPromo.id,
        code: promo.code,
        discount: promo.discount,
        discountType: promo.discountType,
        description: promo.description,
        minOrderAmount: promo.minOrderAmount,
        expiresAt: userPromo.expiresAt,
      });
    } catch (error: any) {
      console.error("Error validating promo:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// ==================== ЗАЩИЩЁННЫЕ РОУТЫ ====================

/**
 * @swagger
 * /tickets/book:
 *   post:
 *     summary: Создать бронирование
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/book",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Требуется авторизация" });
      }

      const { visitDate, visitTime, tickets, userPromocodeId } = req.body;

      // Валидация основных полей
      if (
        !visitDate ||
        !visitTime ||
        !tickets ||
        !Array.isArray(tickets) ||
        tickets.length === 0
      ) {
        return res.status(400).json({ error: "Заполните все поля" });
      }

      // ✅ Проверка что слот свободен
      const existingBooking = await db.query.ticketBookings.findFirst({
        where: and(
          eq(ticketBookings.visitDate, visitDate),
          eq(ticketBookings.visitTime, visitTime),
          eq(ticketBookings.status, "paid"),
        ),
      });

      if (existingBooking) {
        return res.status(400).json({ error: "Этот временной слот уже занят" });
      }

      // ✅ Валидация типов билетов
      let totalPrice = 0;
      const validatedTickets = [];

      for (const ticket of tickets) {
        const ticketType = await db.query.zooTicketTypes.findFirst({
          where: eq(zooTicketTypes.id, Number(ticket.ticketTypeId)),
        });

        if (!ticketType) {
          return res.status(400).json({
            error: `Тип билета с ID ${ticket.ticketTypeId} не найден`,
          });
        }

        if (!ticketType.isActive) {
          return res.status(400).json({
            error: `Тип билета "${ticketType.name}" недоступен`,
          });
        }

        const quantity = Number(ticket.quantity);
        if (quantity <= 0) {
          return res.status(400).json({
            error: `Неверное количество для "${ticketType.name}"`,
          });
        }

        const price = Number(ticketType.price);
        totalPrice += price * quantity;

        validatedTickets.push({
          ticketTypeId: ticketType.id,
          quantity,
          price,
        });
      }

      // ✅ Применение промокода
      let discountAmount = 0;
      let appliedPromoId: number | null = null;

      if (userPromocodeId) {
        const userPromo = await db.query.userPromocodes.findFirst({
          where: and(
            eq(userPromocodes.id, userPromocodeId),
            eq(userPromocodes.userId, userId),
            eq(userPromocodes.status, "available"),
          ),
          with: {
            promocode: true,
          },
        });

        if (userPromo && userPromo.promocode) {
          const promo = userPromo.promocode;
          const now = new Date();

          // Проверяем срок действия
          if (
            new Date(promo.validFrom) <= now &&
            new Date(promo.validUntil) >= now
          ) {
            // Проверяем минимальную сумму
            if (!promo.minOrderAmount || totalPrice >= promo.minOrderAmount) {
              // Вычисляем скидку
              if (promo.discountType === "percent") {
                discountAmount = Math.round(
                  totalPrice * (promo.discount / 100),
                );
              } else {
                discountAmount = Math.min(promo.discount, totalPrice);
              }

              appliedPromoId = userPromo.id;
            }
          }
        }
      }

      const finalPrice = Math.max(0, totalPrice - discountAmount);

      // Создаём бронирование
      const bookingResult = await db
        .insert(ticketBookings)
        .values({
          userId,
          visitDate,
          visitTime,
          totalPrice: finalPrice,
          status: "pending",
        })
        .returning();

      const booking = bookingResult[0];

      if (!booking) {
        return res.status(500).json({ error: "Ошибка создания бронирования" });
      }

      // Добавляем билеты в бронирование
      for (const ticket of validatedTickets) {
        await db.insert(bookingTickets).values({
          bookingId: booking.id,
          ticketTypeId: ticket.ticketTypeId,
          quantity: ticket.quantity,
          price: ticket.price,
        });
      }

      // ✅ Если применили промокод — помечаем его как использованный
      if (appliedPromoId) {
        await db
          .update(userPromocodes)
          .set({
            status: "used",
            usedAt: new Date(),
            orderId: String(booking.id),
            orderType: "booking",
            discountAmount,
          })
          .where(eq(userPromocodes.id, appliedPromoId));

        // Увеличиваем счётчик использования промокода
        await db
          .update(promocodes)
          .set({ usedCount: sql`${promocodes.usedCount} + 1` })
          .where(
            eq(
              promocodes.id,
              sql`(SELECT promocode_id FROM user_promocodes WHERE id = ${appliedPromoId})`,
            ),
          );
      }

      // Получаем полное бронирование с билетами
      const fullBooking = await db.query.ticketBookings.findFirst({
        where: eq(ticketBookings.id, booking.id),
        with: {
          tickets: {
            with: {
              ticketType: true,
            },
          },
        },
      });

      res.status(201).json({
        ...fullBooking,
        discount:
          discountAmount > 0
            ? {
                amount: discountAmount,
                applied: true,
              }
            : null,
      });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: error.message || "Ошибка бронирования" });
    }
  },
);

/**
 * @swagger
 * /tickets/my-bookings:
 *   get:
 *     summary: Получить мои бронирования
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/my-bookings",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Требуется авторизация" });
      }

      const { limit = 50, offset = 0, status } = req.query;

      const whereConditions: any[] = [eq(ticketBookings.userId, userId)];

      if (status) {
        whereConditions.push(eq(ticketBookings.status, String(status)));
      }

      const bookings = await db.query.ticketBookings.findMany({
        where: and(...whereConditions),
        with: {
          tickets: {
            with: {
              ticketType: true,
            },
          },
        },
        orderBy: [desc(ticketBookings.createdAt)],
        limit: Number(limit),
        offset: Number(offset),
      });

      res.json(bookings);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Ошибка загрузки бронирований" });
    }
  },
);

/**
 * @swagger
 * /tickets/bookings/{id}/cancel:
 *   post:
 *     summary: Отменить бронирование
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/bookings/:id/cancel",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const bookingId = Number(req.params.id);

      if (!userId) {
        return res.status(401).json({ error: "Требуется авторизация" });
      }

      const booking = await db.query.ticketBookings.findFirst({
        where: eq(ticketBookings.id, bookingId),
      });

      if (!booking) {
        return res.status(404).json({ error: "Бронирование не найдено" });
      }

      if (booking.userId !== userId) {
        return res.status(403).json({ error: "Нет доступа" });
      }

      if (booking.status === "cancelled") {
        return res.status(400).json({ error: "Бронирование уже отменено" });
      }

      if (booking.status === "paid") {
        return res.status(400).json({
          error:
            "Оплаченное бронирование нельзя отменить. Обратитесь в поддержку.",
        });
      }

      await db
        .update(ticketBookings)
        .set({ status: "cancelled" })
        .where(eq(ticketBookings.id, bookingId));

      res.json({ message: "Бронирование отменено" });
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * @swagger
 * /tickets/bookings/{id}/payment:
 *   post:
 *     summary: Подтвердить оплату
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/bookings/:id/payment",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const bookingId = Number(req.params.id);
      const { paymentId } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "Требуется авторизация" });
      }

      const booking = await db.query.ticketBookings.findFirst({
        where: eq(ticketBookings.id, bookingId),
      });

      if (!booking) {
        return res.status(404).json({ error: "Бронирование не найдено" });
      }

      if (booking.userId !== userId) {
        return res.status(403).json({ error: "Нет доступа" });
      }

      if (booking.status === "paid") {
        return res.status(400).json({ error: "Бронирование уже оплачено" });
      }

      if (booking.status === "cancelled") {
        return res.status(400).json({ error: "Бронирование отменено" });
      }

      await db
        .update(ticketBookings)
        .set({
          status: "paid",
          paymentId: paymentId || `payment_${Date.now()}`,
        })
        .where(eq(ticketBookings.id, bookingId));

      res.json({ message: "Оплата подтверждена" });
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

// ==================== АДМИН РОУТЫ ====================

/**
 * @swagger
 * /tickets/admin/all-bookings:
 *   get:
 *     summary: Получить все бронирования (админ)
 *     tags: [Tickets/Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/admin/all-bookings",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin" && req.user?.role !== "dev") {
        return res.status(403).json({ error: "Доступ запрещён" });
      }

      const { limit = 100, offset = 0, status, date } = req.query;

      const whereConditions: any[] = [];

      if (status) {
        whereConditions.push(eq(ticketBookings.status, String(status)));
      }

      if (date) {
        whereConditions.push(eq(ticketBookings.visitDate, String(date)));
      }

      const bookings = await db.query.ticketBookings.findMany({
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          user: {
            columns: { id: true, name: true, email: true },
          },
          tickets: {
            with: {
              ticketType: true,
            },
          },
        },
        orderBy: [desc(ticketBookings.createdAt)],
        limit: Number(limit),
        offset: Number(offset),
      });

      res.json(bookings);
    } catch (error: any) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * @swagger
 * /tickets/admin/stats:
 *   get:
 *     summary: Статистика по билетам (админ)
 *     tags: [Tickets/Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/admin/stats",
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.user?.role !== "admin" && req.user?.role !== "dev") {
        return res.status(403).json({ error: "Доступ запрещён" });
      }

      const stats = await db
        .select({
          status: ticketBookings.status,
          count: sql<number>`count(*)`,
          totalRevenue: sql<number>`coalesce(sum(${ticketBookings.totalPrice}), 0)`,
        })
        .from(ticketBookings)
        .groupBy(ticketBookings.status);

      const totalBookings = await db
        .select({ count: sql<number>`count(*)` })
        .from(ticketBookings);

      res.json({
        byStatus: stats,
        totalBookings: Number(totalBookings[0]?.count || 0),
      });
    } catch (error: any) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
