import { Router } from "express";
import type { Request, Response } from "express";
import * as zoneController from "../controllers/zone.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ==================== ПУБЛИЧНЫЕ РОУТЫ ====================

// Получить все зоны
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await zoneController.getAllZones();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Получить зону по ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const zone = await zoneController.getZoneById(Number(req.params.id));
    res.json(zone);
  } catch (error: any) {
    const status = error.statusCode || 404;
    res.status(status).json({ error: error.message });
  }
});

// ==================== АДМИН РОУТЫ ====================

// Создать зону
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const result = await zoneController.createZone(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ error: error.message });
  }
});

// Обновить зону
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const result = await zoneController.updateZone(
      Number(req.params.id),
      req.body,
    );
    res.json(result);
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ error: error.message });
  }
});

// Удалить зону
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    await zoneController.deleteZone(Number(req.params.id));
    res.json({ message: "Зона удалена" });
  } catch (error: any) {
    const status = error.statusCode || 400;
    res.status(status).json({ error: error.message });
  }
});

export default router;
