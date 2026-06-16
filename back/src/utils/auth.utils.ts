import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}
export function generatePassword(name: string) {
  if (!name || name.trim() === "") {
    throw new Error("Имя не может быть пустым");
  }

  const chars = name.split("");

  // Перемешиваем символы (Fisher-Yates)
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const temp = chars[i]!;
    chars[i] = chars[j]!;
    chars[j] = temp;
  }

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%_-";
  let salt = "";
  const saltLength = Math.floor(Math.random() * 7) + 6;

  for (let i = 0; i < saltLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    salt += characters.charAt(randomIndex);
  }

  return chars.join("") + salt;
}

export function generateToken(userId: number, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(
  token: string,
): { userId: number; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
  } catch {
    return null;
  }
}
export function extractLogin(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex === -1) {
    throw new Error("Некорректный email");
  }
  return email.slice(0, atIndex);
}
