import { Router } from "express";
import type { Request, Response } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 description: Имя пользователя
 *                 example: "Иван Иванов"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email пользователя
 *                 example: "ivan@example.com"
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     login:
 *                       type: string
 *                     role:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 password:
 *                   type: string
 *                   description: Сгенерированный пароль (сохраните!)
 *                 token:
 *                   type: string
 *                   description: JWT токен для авторизации
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "name и email обязательны" });
    }

    const result = await authController.register({ name, email });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email или login пользователя
 *                 example: "ivan@example.com"
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *                 example: "mypassword123"
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     login:
 *                       type: string
 *                     role:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT токен
 *       401:
 *         description: Неверный email/логин или пароль
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, identifier, password } = req.body;
    const loginIdentifier = email || identifier;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        error: "email (или identifier) и password обязательны",
      });
    }

    const result = await authController.login(loginIdentifier, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Получить данные текущего пользователя
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
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
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 */
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await authController.getMe(req.user!.userId);
    res.json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Сменить пароль
 *     tags: [Authentication]
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
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Пароль успешно изменён
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Ошибка (неверный старый пароль или короткий новый)
 *       401:
 *         description: Не авторизован
 */
router.post(
  "/change-password",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          error: "oldPassword и newPassword обязательны",
        });
      }

      const result = await authController.changePassword(
        req.user!.userId,
        oldPassword,
        newPassword,
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },
);

export default router;
