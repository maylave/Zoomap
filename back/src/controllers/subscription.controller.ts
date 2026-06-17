import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { subscriptions, users } from "../db/schema.js";
import {
  generatePassword,
  hashPassword,
  extractLogin,
  generateToken,
} from "../utils/auth.utils.js";

// ==================== ТИПЫ ====================

export interface SubscriptionInput {
  name: string;
  email: string;
  subscribe?: boolean;
}

// ==================== ПОДПИСКА ====================

export async function subscribe(input: SubscriptionInput) {
  const { name, email, subscribe: wantSubscribe = true } = input;

  // Валидация
  if (!name || !email) {
    throw new Error("Имя и email обязательны");
  }

  // Проверка формата email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Неверный формат email");
  }

  // Проверяем, существует ли уже подписка
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.email, email),
  });

  let promoCode: string;
  let password: string | undefined; // ✅ Объявляем переменную здесь
  let token: string | undefined; // ✅ И токен тоже

  if (existing) {
    if (existing.subscribe) {
      // Уже подписан — ошибка
      const error = new Error("Этот email уже подписан на новости");
      (error as any).statusCode = 409;
      throw error;
    } else {
      // Был отписан — реактивируем
      await db
        .update(subscriptions)
        .set({
          subscribe: true,
          name,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.email, email));
    }
  } else {
    // Создаём новую подписку
    await db.insert(subscriptions).values({
      name,
      email,
      subscribe: wantSubscribe,
    });
  }

  // Проверяем, существует ли пользователь
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  // Если пользователь не зарегистрирован — создаём его
  if (!existingUser) {
    password = generatePassword(name); // ✅ Присваиваем здесь
    const hashedPassword = await hashPassword(password);
    const login = extractLogin(email);

    const result = await db
      .insert(users)
      .values({
        name,
        login,
        email,
        password: hashedPassword,
        role: "user",
      })
      .returning();

    const user = result[0];
    token = generateToken(user!.id, user!.role); // ✅ Генерируем токен
  }

  // Генерируем промокод
  promoCode = `ZOO10-${Date.now().toString(36).toUpperCase()}`;

  return {
    message: "Вы успешно подписались!",
    promoCode,
    email,
    password, // ✅ Теперь доступно
    token, // ✅ И токен тоже
  };
}

// ==================== ОТПИСКА ====================

export async function unsubscribe(email: string) {
  if (!email) {
    throw new Error("Email обязателен");
  }

  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.email, email),
  });

  if (!existing) {
    throw new Error("Подписка не найдена");
  }

  if (!existing.subscribe) {
    throw new Error("Вы уже отписаны");
  }

  await db
    .update(subscriptions)
    .set({
      subscribe: false,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.email, email));

  return {
    message: "Вы отписались от новостей",
    email,
  };
}

// ==================== ПРОВЕРКА СТАТУСА ====================

export async function checkSubscriptionStatus(email: string) {
  if (!email) {
    throw new Error("Email обязателен");
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.email, email),
  });

  return {
    email,
    isSubscribed: subscription?.subscribe === true,
    subscribedAt: subscription?.createdAt || null,
  };
}

// ==================== ПОЛУЧИТЬ ВСЕХ ПОДПИСЧИКОВ (для админа) ====================

export async function getAllSubscribers() {
  const subscribers = await db.query.subscriptions.findMany({
    orderBy: (subscriptions, { desc }) => [desc(subscriptions.createdAt)],
  });

  return {
    total: subscribers.length,
    active: subscribers.filter((s) => s.subscribe).length,
    inactive: subscribers.filter((s) => !s.subscribe).length,
    subscribers,
  };
}
