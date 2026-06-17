import { Router } from "express";
import type { Request, Response } from "express";
import * as subscriptionController from "../controllers/subscription.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// ==================== ПУБЛИЧНЫЕ РОУТЫ ====================

/**
 * @swagger
 * /subscription/subscribe:
 *   post:
 *     summary: Подписка на новости (с автоматической регистрацией)
 *     tags: [Subscription]
 */
router.post("/subscribe", async (req: Request, res: Response) => {
  try {
    const result = await subscriptionController.subscribe(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ error: error.message });
  }
});

/**
 * @swagger
 * /subscription/unsubscribe:
 *   post:
 *     summary: Отписка от новостей
 *     tags: [Subscription]
 */
router.post("/unsubscribe", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await subscriptionController.unsubscribe(email);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /subscription/status:
 *   get:
 *     summary: Проверить статус подписки
 *     tags: [Subscription]
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    const result = await subscriptionController.checkSubscriptionStatus(email);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== АДМИН РОУТЫ ====================

/**
 * @swagger
 * /subscription/admin/subscribers:
 *   get:
 *     summary: Получить всех подписчиков (для админа)
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  "/admin/subscribers",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const result = await subscriptionController.getAllSubscribers();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

export default router;
