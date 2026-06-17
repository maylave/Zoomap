import { Router } from "express";
import type { Request, Response } from "express";
import * as profileController from "../controllers/profile.controller.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../utils/upload.js";

const router = Router();

// Все роуты требуют авторизации
router.use(authenticate);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Получить мой профиль
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные профиля
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 login:
 *                   type: string
 *                 role:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const profile = await profileController.getMyProfile(req.user!.userId);
    res.json(profile);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Обновить профиль
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Мария"
 *               email:
 *                 type: string
 *                 example: "maria@example.com"
 *               phone:
 *                 type: string
 *                 example: "+7 (999) 123-45-67"
 *     responses:
 *       200:
 *         description: Профиль обновлён
 */
router.put("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    const profile = await profileController.updateMyProfile(req.user!.userId, {
      name,
      email,
      phone,
    });

    res.json(profile);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /profile/change-password:
 *   post:
 *     summary: Сменить пароль
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пароль изменён
 *       400:
 *         description: Ошибка
 */
router.post("/change-password", async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const result = await profileController.changeMyPassword(
      req.user!.userId,
      oldPassword,
      newPassword,
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /profile/avatar:
 *   post:
 *     summary: Загрузить аватар
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Аватар загружен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 avatarUrl:
 *                   type: string
 */
router.post(
  "/avatar",
  upload.single("avatar"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Файл не загружен" });
      }

      const result = await profileController.uploadAvatar(
        req.user!.userId,
        req.file,
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

/**
 * @swagger
 * /profile/avatar:
 *   delete:
 *     summary: Удалить аватар
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Аватар удалён
 */
router.delete("/avatar", async (req: Request, res: Response) => {
  try {
    const result = await profileController.deleteAvatar(req.user!.userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /profile/settings:
 *   get:
 *     summary: Получить настройки
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Настройки пользователя
 */
router.get("/settings", async (req: Request, res: Response) => {
  try {
    const settings = await profileController.getUserSettings(req.user!.userId);
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /profile/settings:
 *   put:
 *     summary: Обновить настройки
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email: { type: boolean }
 *                   push: { type: boolean }
 *                   sms: { type: boolean }
 *               theme:
 *                 type: string
 *                 enum: [light, dark]
 *               language:
 *                 type: string
 *                 example: "ru"
 *     responses:
 *       200:
 *         description: Настройки сохранены
 */
router.put("/settings", async (req: Request, res: Response) => {
  try {
    const settings = req.body;

    const result = await profileController.updateUserSettings(
      req.user!.userId,
      settings,
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /profile/purchases:
 *   get:
 *     summary: История покупок
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список покупок
 */
router.get("/purchases", async (req: Request, res: Response) => {
  try {
    const purchases = await profileController.getPurchaseHistory(
      req.user!.userId,
    );
    res.json(purchases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
