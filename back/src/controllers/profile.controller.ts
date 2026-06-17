import { eq, desc } from "drizzle-orm"; // ← Добавьте desc
import { db } from "../db/index.js";
import { users, ticketBookings } from "../db/schema.js";
ticketBookings;
import { hashPassword, comparePassword } from "../utils/auth.utils.js";
import path from "path";
import fs from "fs/promises";
import type { Request } from "express";

// ==================== ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ====================

// Получить текущий профиль
export async function getMyProfile(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      login: true,
      email: true,
      role: true,
      createdAt: true,
      // password не возвращаем
    },
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  return user;
}

// Обновить профиль
export async function updateMyProfile(
  userId: number,
  data: {
    name?: string;
    email?: string;
    phone?: string;
  },
) {
  // Проверяем, не занят ли email другим пользователем
  if (data.email) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error("Этот email уже используется");
    }
  }

  const result = await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      login: users.login,
      role: users.role,
      createdAt: users.createdAt,
    });

  return result[0];
}

// Сменить пароль
export async function changeMyPassword(
  userId: number,
  oldPassword: string,
  newPassword: string,
) {
  // Получаем текущего пользователя
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  // Проверяем старый пароль
  const isValid = await comparePassword(oldPassword, user.password);
  if (!isValid) {
    throw new Error("Неверный текущий пароль");
  }

  // Валидация нового пароля
  if (newPassword.length < 6) {
    throw new Error("Новый пароль должен быть минимум 6 символов");
  }

  // Хешируем новый пароль
  const hashedPassword = await hashPassword(newPassword);

  // Обновляем пароль
  await db
    .update(users)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { message: "Пароль успешно изменён" };
}

// Загрузить аватар
export async function uploadAvatar(userId: number, file: Express.Multer.File) {
  // Проверяем тип файла
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error("Разрешены только изображения JPG, PNG, WEBP");
  }

  // Проверяем размер (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Размер файла не должен превышать 5MB");
  }

  // Создаём путь для аватара
  const avatarDir = `uploads/avatars/${userId}`;
  await fs.mkdir(avatarDir, { recursive: true });

  // Удаляем старый аватар если есть
  const oldFiles = await fs.readdir(avatarDir);
  for (const oldFile of oldFiles) {
    await fs.unlink(path.join(avatarDir, oldFile));
  }

  // Сохраняем новый аватар
  const fileExt = path.extname(file.originalname);
  const fileName = `avatar${fileExt}`;
  const filePath = path.join(avatarDir, fileName);

  await fs.writeFile(filePath, file.buffer);

  // Формируем URL
  const avatarUrl = `/uploads/avatars/${userId}/${fileName}`;

  // Обновляем пользователя (если есть поле avatar в схеме)
  // Если поля нет, возвращаем просто URL
  return { avatarUrl };
}

// Удалить аватар
export async function deleteAvatar(userId: number) {
  const avatarDir = `uploads/avatars/${userId}`;

  try {
    const files = await fs.readdir(avatarDir);
    for (const file of files) {
      await fs.unlink(path.join(avatarDir, file));
    }
    await fs.rmdir(avatarDir);
  } catch (error) {
    // Папка может не существовать
  }

  // Обновляем пользователя (сбрасываем avatar)
  // await db.update(users).set({ avatar: null }).where(eq(users.id, userId));

  return { message: "Аватар удалён" };
}

// Получить настройки пользователя
export async function getUserSettings(userId: number) {
  // Здесь можно вернуть настройки из отдельной таблицы settings
  // Пока возвращаем дефолтные
  return {
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    theme: "dark",
    language: "ru",
  };
}

// Обновить настройки
export async function updateUserSettings(
  userId: number,
  settings: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    theme?: string;
    language?: string;
  },
) {
  // Здесь можно сохранить в таблицу settings
  // Пока просто возвращаем
  return {
    message: "Настройки сохранены",
    settings,
  };
}

// Получить историю покупок
export async function getPurchaseHistory(userId: number) {
  const purchases = await db.query.ticketBookings.findMany({
    where: eq(ticketBookings.userId, userId),
    with: {
      tickets: {
        with: {
          ticketType: {
            columns: { name: true, price: true },
          },
        },
      },
    },
    orderBy: desc(ticketBookings.createdAt),
  });

  return purchases;
}
