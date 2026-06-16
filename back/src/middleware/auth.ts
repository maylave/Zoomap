import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.utils.js";

// Расширяем тип Request, чтобы добавить пользователя
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
      };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Не авторизован" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Невалидный токен" });
  }

  req.user = decoded;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const allowedRoles = ["admin", "dev"];

  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ error: "Доступ запрещён. Нужны права администратора" });
  }
  next();
}
