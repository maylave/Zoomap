import { eq, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  generatePassword,
  extractLogin,
} from "../utils/auth.utils.js";

export interface userInput {
  name: string;
  email: string;
}

export async function register(input: userInput) {
  const { name, email } = input;
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser.length > 0) {
    throw new Error("Пользователь с таким email уже существует");
  }

  const password = generatePassword(name);
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
  const token = generateToken(user!.id, user!.role);

  return {
    user: {
      id: user!.id,
      name: user!.name,
      login: user!.login,
      email: user!.email,
      role: user!.role,
    },
    password,
    token,
  };
}

export async function login(identifier: string, password: string) {
  const isEmail = identifier.includes("@");

  const result = await db
    .select()
    .from(users)
    .where(isEmail ? eq(users.email, identifier) : eq(users.login, identifier));

  const user = result[0];

  if (!user) {
    throw new Error("Неверный email/логин или пароль");
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    throw new Error("Неверный email/логин или пароль");
  }

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      login: user.login,
      role: user.role,
    },
    token,
  };
}

export async function getMe(userId: number) {
  const result = await db.select().from(users).where(eq(users.id, userId));
  const user = result[0];

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    login: user.login,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function changePassword(
  userId: number,
  oldPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  const result = await db.select().from(users).where(eq(users.id, userId));
  const user = result[0];

  if (!user) {
    throw new Error("Пользователь не найден");
  }

  const isValidPassword = await comparePassword(oldPassword, user.password);
  if (!isValidPassword) {
    throw new Error("Пароль не верный");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Новый пароль должен быть минимум 6 символов");
  }

  const hashedPassword = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, userId));

  return { message: "Пароль успешно изменён" };
}
