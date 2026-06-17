import { Router } from "express";
import type { Request, Response } from "express";
import * as galleryController from "../controllers/gallery.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ==================== ПУБЛИЧНЫЕ РОУТЫ ====================

// Получить все фото галереи
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await galleryController.getAllPhotos(req.query);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Получить фото по ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await galleryController.getPhotoById(Number(req.params.id));
    res.json(result);
  } catch (error: any) {
    const status = error.statusCode || 404;
    res.status(status).json({ error: error.message });
  }
});

// ==================== АДМИН РОУТЫ ====================

// Добавить новое фото
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    // Проверка прав админа
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const result = await galleryController.createPhoto(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Обновить фото
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const result = await galleryController.updatePhoto(
      Number(req.params.id),
      req.body,
    );
    res.json(result);
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ error: error.message });
  }
});

// Удалить фото
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    await galleryController.deletePhoto(Number(req.params.id));
    res.json({ message: "Фото удалено" });
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ error: error.message });
  }
});

export default router;
