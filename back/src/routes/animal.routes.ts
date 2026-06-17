import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { animals, zones, reviews } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Получить всех животных
router.get("/", async (req: Request, res: Response) => {
  try {
    const animalsList = await db.query.animals.findMany({
      with: {
        zone: {
          columns: { id: true, name: true },
        },
        photos: {
          columns: { id: true, url: true, isPrimary: true },
        },
      },
    });

    res.json(animalsList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Получить животное по ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const animal = await db.query.animals.findFirst({
      where: eq(animals.id, Number(req.params.id)),
      with: {
        zone: true,
        photos: true,
        reviews: {
          with: {
            user: {
              columns: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!animal) {
      return res.status(404).json({ error: "Животное не найдено" });
    }

    res.json(animal);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все зоны
router.get("/zones", async (req: Request, res: Response) => {
  try {
    const zonesList = await db.query.zones.findMany();
    res.json(zonesList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
