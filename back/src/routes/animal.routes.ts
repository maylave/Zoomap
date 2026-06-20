import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../db/index.js";
import { animals, zones, animalPhotos, reviews } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ==================== ПУБЛИЧНЫЕ РОУТЫ ====================

// Получить всех животных
router.get("/", async (req: Request, res: Response) => {
  try {
    const { zoneId, limit = 100, offset = 0 } = req.query;

    const whereConditions: any[] = [];

    if (zoneId && zoneId !== "0") {
      whereConditions.push(eq(animals.zoneId, Number(zoneId)));
    }

    const animalsList = await db.query.animals.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      with: {
        zone: {
          columns: { id: true, name: true },
        },
        photos: {
          columns: {
            id: true,
            url: true,
            isPrimary: true,
            caption: true,
            altText: true,
          },
        },
        reviews: {
          columns: { id: true, rating: true },
        },
      },
      orderBy: [desc(animals.createdAt)],
      limit: Number(limit),
      offset: Number(offset),
    });

    // ✅ Маппим в UI формат
    const mappedAnimals = animalsList.map((animal) => {
      const primaryPhoto =
        animal.photos?.find((p: any) => p.isPrimary) || animal.photos?.[0];
      const reviewsCount = animal.reviews?.length || 0;
      const avgRating =
        reviewsCount > 0
          ? animal.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
            reviewsCount
          : Number(animal.rating) || 0;

      return {
        id: animal.id,
        name: animal.name,
        scientificName: animal.species,
        zone: animal.zone?.name || "Неизвестно",
        zoneId: animal.zoneId,
        image:
          primaryPhoto?.url ||
          "https://via.placeholder.com/800x600?text=No+Image",
        description: animal.description || "",
        diet: animal.diet,
        weight: animal.weight ? `${animal.weight} кг` : "Неизвестно",
        age: animal.age ? `${animal.age} лет` : "Неизвестно",
        lifespan: "Неизвестно",
        rating: avgRating,
        reviewsCount: reviewsCount,
        reviews: [],
      };
    });

    // ✅ Возвращаем объект, а не массив!
    res.json({
      animals: mappedAnimals,
      total: mappedAnimals.length,
    });
  } catch (error: any) {
    console.error("Error fetching animals:", error);
    res.status(500).json({ error: error.message });
  }
});

// Получить животное по ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const animal = await db.query.animals.findFirst({
      where: eq(animals.id, Number(req.params.id)),
      with: {
        zone: {
          columns: { id: true, name: true },
        },
        photos: {
          columns: {
            id: true,
            url: true,
            isPrimary: true,
            caption: true,
            altText: true,
          },
        },
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

    // Маппим в UI формат
    const primaryPhoto =
      animal.photos?.find((p: any) => p.isPrimary) || animal.photos?.[0];
    const reviewsCount = animal.reviews?.length || 0;
    const avgRating =
      reviewsCount > 0
        ? animal.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          reviewsCount
        : Number(animal.rating) || 0;

    const mappedAnimal = {
      id: animal.id,
      name: animal.name,
      scientificName: animal.species,
      zone: animal.zone?.name || "Неизвестно",
      zoneId: animal.zoneId,
      image:
        primaryPhoto?.url ||
        "https://via.placeholder.com/800x600?text=No+Image",
      description: animal.description || "",
      diet: animal.diet,
      weight: animal.weight ? `${animal.weight} кг` : "Неизвестно",
      age: animal.age ? `${animal.age} лет` : "Неизвестно",
      lifespan: "Неизвестно",
      rating: avgRating,
      reviewsCount: reviewsCount,
      reviews: (animal.reviews || []).map((review: any) => ({
        id: review.id,
        author: review.user?.name || "Аноним",
        rating: review.rating,
        text: review.comment || "",
        date: review.createdAt.toISOString().split("T")[0],
      })),
      photos: (animal.photos || []).map((photo: any) => ({
        id: photo.id,
        url: photo.url,
        caption: photo.caption,
        altText: photo.altText,
        isPrimary: photo.isPrimary,
      })),
    };

    res.json(mappedAnimal);
  } catch (error: any) {
    console.error("Error fetching animal:", error);
    res.status(500).json({ error: error.message });
  }
});

// Получить отзывы животного
router.get("/:id/reviews", async (req: Request, res: Response) => {
  try {
    const reviewsList = await db.query.reviews.findMany({
      where: eq(reviews.animalId, Number(req.params.id)),
      with: {
        user: {
          columns: { id: true, name: true },
        },
      },
      orderBy: [desc(reviews.createdAt)],
    });

    const mappedReviews = reviewsList.map((review) => ({
      id: review.id,
      author: review.user?.name || "Аноним",
      rating: review.rating,
      text: review.comment || "",
      date: review.createdAt.toISOString().split("T")[0],
    }));

    res.json(mappedReviews);
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== АДМИН РОУТЫ ====================

// Создать животное
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const { name, species, zoneId, diet, weight, age, description, image } =
      req.body;

    if (!name || !species || !zoneId || !diet) {
      return res
        .status(400)
        .json({ error: "Все обязательные поля должны быть заполнены" });
    }

    // Проверяем что зона существует
    const zone = await db.query.zones.findFirst({
      where: eq(zones.id, zoneId),
    });

    if (!zone) {
      return res.status(404).json({ error: "Зона не найдена" });
    }

    // Создаём животное
    const result = await db
      .insert(animals)
      .values({
        name,
        species,
        zoneId,
        diet,
        weight: weight || null,
        age: age || null,
        description: description || null,
      })
      .returning();

    const animal = result[0];

    // Если есть image - добавляем как главное фото
    if (image) {
      await db.insert(animalPhotos).values({
        animalId: animal.id,
        url: image,
        caption: name,
        altText: name,
        isPrimary: true,
      });
    }

    res.status(201).json(animal);
  } catch (error: any) {
    console.error("Error creating animal:", error);
    res.status(400).json({ error: error.message });
  }
});

// Обновить животное
router.put("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const id = Number(req.params.id);
    const { name, species, zoneId, diet, weight, age, description, image } =
      req.body;

    const existingAnimal = await db.query.animals.findFirst({
      where: eq(animals.id, id),
    });

    if (!existingAnimal) {
      return res.status(404).json({ error: "Животное не найдено" });
    }

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (species !== undefined) updateData.species = species;
    if (zoneId !== undefined) {
      const zone = await db.query.zones.findFirst({
        where: eq(zones.id, zoneId),
      });
      if (!zone) {
        return res.status(404).json({ error: "Зона не найдена" });
      }
      updateData.zoneId = zoneId;
    }
    if (diet !== undefined) updateData.diet = diet;
    if (weight !== undefined) updateData.weight = weight;
    if (age !== undefined) updateData.age = age;
    if (description !== undefined) updateData.description = description;

    await db.update(animals).set(updateData).where(eq(animals.id, id));

    // Если обновляется image - обновляем главное фото
    if (image !== undefined) {
      const primaryPhoto = await db.query.animalPhotos.findFirst({
        where: and(
          eq(animalPhotos.animalId, id),
          eq(animalPhotos.isPrimary, true),
        ),
      });

      if (primaryPhoto) {
        await db
          .update(animalPhotos)
          .set({ url: image })
          .where(eq(animalPhotos.id, primaryPhoto.id));
      } else if (image) {
        await db.insert(animalPhotos).values({
          animalId: id,
          url: image,
          caption: name || existingAnimal.name,
          altText: name || existingAnimal.name,
          isPrimary: true,
        });
      }
    }

    const updatedAnimal = await db.query.animals.findFirst({
      where: eq(animals.id, id),
      with: {
        zone: {
          columns: { id: true, name: true },
        },
        photos: {
          columns: { id: true, url: true, isPrimary: true },
        },
      },
    });

    res.json(updatedAnimal);
  } catch (error: any) {
    console.error("Error updating animal:", error);
    res.status(400).json({ error: error.message });
  }
});

// Удалить животное
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin" && req.user?.role !== "dev") {
      return res.status(403).json({ error: "Доступ запрещён" });
    }

    const id = Number(req.params.id);

    const animal = await db.query.animals.findFirst({
      where: eq(animals.id, id),
    });

    if (!animal) {
      return res.status(404).json({ error: "Животное не найдено" });
    }

    await db.delete(animals).where(eq(animals.id, id));

    res.json({ message: "Животное удалено" });
  } catch (error: any) {
    console.error("Error deleting animal:", error);
    res.status(400).json({ error: error.message });
  }
});

// Добавить отзыв
router.post(
  "/:id/reviews",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Требуется авторизация" });
      }

      const { rating, comment } = req.body;

      if (!rating) {
        return res.status(400).json({ error: "Рейтинг обязателен" });
      }

      const animalId = Number(req.params.id);

      const animal = await db.query.animals.findFirst({
        where: eq(animals.id, animalId),
      });

      if (!animal) {
        return res.status(404).json({ error: "Животное не найдено" });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Рейтинг должен быть от 1 до 5" });
      }

      // Создаём отзыв
      const result = await db
        .insert(reviews)
        .values({
          animalId,
          userId,
          rating,
          comment: comment || null,
        })
        .returning();

      // Обновляем рейтинг животного
      const allReviews = await db.query.reviews.findMany({
        where: eq(reviews.animalId, animalId),
      });

      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await db
        .update(animals)
        .set({
          rating: avgRating.toFixed(2),
          reviewsCount: allReviews.length,
        })
        .where(eq(animals.id, animalId));

      res.status(201).json(result[0]);
    } catch (error: any) {
      console.error("Error adding review:", error);
      res.status(400).json({ error: error.message });
    }
  },
);

export default router;
