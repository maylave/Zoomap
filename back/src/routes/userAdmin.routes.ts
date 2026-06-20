import { Router } from "express";
import type { Request, Response } from "express";
import { eq, desc, asc, and, or, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ==================== ПОЛЬЗОВАТЕЛИ ====================

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Получить всех пользователей (админ)
 *     tags: [Admin/Users]
 *     security:
 *       - bearerAuth: []
 */
router.get("/", authenticate, async (req: Request, res: Response) => {
  console.log("🔍 GET /admin/users called");
  console.log("User role:", req.user?.role);

  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      console.log("❌ Access denied");
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const { role, status, search, limit = 100, offset = 0 } = req.query;

    const whereConditions: any[] = [];

    if (role) {
      const roleValue = String(role) as "user" | "admin" | "dev";
      whereConditions.push(eq(users.role, roleValue));
    }

    if (search) {
      const searchTerm = `%${String(search).toLowerCase()}%`;
      whereConditions.push(
        or(
          sql`LOWER(${users.name}) LIKE ${searchTerm}`,
          sql`LOWER(${users.email}) LIKE ${searchTerm}`,
          sql`LOWER(${users.login}) LIKE ${searchTerm}`,
        ),
      );
    }

    const usersList = await db.query.users.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      orderBy: [desc(users.createdAt)],
      limit: Number(limit),
      offset: Number(offset),
    });

    // Убираем пароль
    const safeUsers = usersList.map(({ password, ...user }) => user);

    // Маппим в UI формат
    const mappedUsers = safeUsers.map((user) => ({
      id: user.id,
      firstName: user.name.split(" ")[0] || user.name,
      lastName: user.name.split(" ").slice(1).join(" ") || "",
      email: user.email,
      role: user.role,
      status: "active" as const,
      registeredAt: user.createdAt.toISOString().split("T")[0],
      lastLogin: "Недавно",
    }));

    console.log("✅ Returning", mappedUsers.length, "users");

    res.json({
      users: mappedUsers,
      total: mappedUsers.length,
    });
  } catch (error: any) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Обновить пользователя (админ)
 *     tags: [Admin/Users]
 *     security:
 *       - bearerAuth: []
 */
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const userId = Number(req.params.id);
    const { firstName, lastName, email, role } = req.body;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const updateData: any = {};

    if (firstName !== undefined || lastName !== undefined) {
      const name = `${firstName || existingUser.name.split(" ")[0]} ${
        lastName || existingUser.name.split(" ").slice(1).join(" ")
      }`.trim();
      updateData.name = name;
    }

    if (email !== undefined) {
      const existingEmail = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (existingEmail && existingEmail.id !== userId) {
        return res.status(400).json({ error: "Email уже используется" });
      }
      updateData.email = email;
    }

    if (role !== undefined) {
      const validRoles = ["user", "admin", "dev"] as const;
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: "Недопустимая роль" });
      }
      updateData.role = role;
    }

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    const user = result[0];

    if (!user) {
      return res
        .status(404)
        .json({ error: "Пользователь не найден после обновления" });
    }

    res.json({
      id: user.id,
      firstName: user.name.split(" ")[0] || user.name,
      lastName: user.name.split(" ").slice(1).join(" ") || "",
      email: user.email,
      role: user.role,
      status: "active",
      registeredAt: user.createdAt.toISOString().split("T")[0],
      lastLogin: "Недавно",
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Удалить пользователя (админ)
 *     tags: [Admin/Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const userId = Number(req.params.id);

    if (userId === req.user?.userId) {
      return res.status(400).json({ error: "Нельзя удалить свой аккаунт" });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    await db.delete(users).where(eq(users.id, userId));

    res.json({ message: "Пользователь удалён" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 * /admin/users/create:
 *   post:
 *     summary: Создать пользователя (админ)
 *     tags: [Admin/Users]
 *     security:
 *       - bearerAuth: []
 */
router.post("/create", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const { firstName, lastName, email, role } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({ error: "Имя и email обязательны" });
    }

    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingEmail) {
      return res.status(400).json({ error: "Email уже используется" });
    }

    const login = email.split("@")[0];

    const existingLogin = await db.query.users.findFirst({
      where: eq(users.login, login),
    });

    const finalLogin = existingLogin ? `${login}_${Date.now()}` : login;

    const tempPassword = `temp_${Math.random().toString(36).slice(-8)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const name = `${firstName} ${lastName || ""}`.trim();

    const validRoles = ["user", "admin", "dev"] as const;
    const userRole = role && validRoles.includes(role) ? role : "user";

    const result = await db
      .insert(users)
      .values({
        name,
        login: finalLogin,
        email,
        password: hashedPassword,
        role: userRole,
      })
      .returning();

    const user = result[0];

    if (!user) {
      return res.status(500).json({ error: "Ошибка создания пользователя" });
    }

    res.status(201).json({
      id: user.id,
      firstName: user.name.split(" ")[0] || user.name,
      lastName: user.name.split(" ").slice(1).join(" ") || "",
      email: user.email,
      role: user.role,
      status: "active",
      registeredAt: user.createdAt.toISOString().split("T")[0],
      lastLogin: "Никогда",
      tempPassword,
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
