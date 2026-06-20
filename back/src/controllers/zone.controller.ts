import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { zones, animals, animalPhotos } from "../db/schema.js";

// ==================== ТИПЫ ====================

export interface CreateZoneInput {
  name: string;
  description?: string;
  image?: string;
  climate?: string;
  hours?: string;
  location?: string;
  positionX: number;
  positionY: number;
}

export interface UpdateZoneInput {
  name?: string;
  description?: string;
  image?: string;
  climate?: string;
  hours?: string;
  location?: string;
  positionX?: number;
  positionY?: number;
}

// ==================== ПОЛУЧИТЬ ВСЕ ЗОНЫ ====================

export async function getAllZones() {
  // Получаем все зоны
  const zonesList = await db
    .select()
    .from(zones)
    .orderBy(desc(zones.createdAt));

  // Для каждой зоны получаем животных
  const zonesWithAnimals = await Promise.all(
    zonesList.map(async (zone) => {
      // Получаем животных этой зоны
      const zoneAnimals = await db
        .select({
          id: animals.id,
          name: animals.name,
          species: animals.species,
          description: animals.description,
          rating: animals.rating,
        })
        .from(animals)
        .where(eq(animals.zoneId, zone.id));

      // Для каждого животного получаем фото
      const animalsWithPhotos = await Promise.all(
        zoneAnimals.map(async (animal) => {
          const photos = await db
            .select({
              id: animalPhotos.id,
              url: animalPhotos.url,
              isPrimary: animalPhotos.isPrimary,
            })
            .from(animalPhotos)
            .where(eq(animalPhotos.animalId, animal.id));

          const primaryPhoto = photos.find((p) => p.isPrimary) || photos[0];

          return {
            id: animal.id,
            name: animal.name,
            species: animal.species,
            description: animal.description,
            rating: Number(animal.rating) || 0,
            image: primaryPhoto?.url,
          };
        }),
      );

      // Парсим позицию
      let position = { x: zone.positionX, y: zone.positionY };
      if (zone.mapPosition) {
        try {
          const parsed = JSON.parse(zone.mapPosition);
          position = {
            x: parsed.x || zone.positionX,
            y: parsed.y || zone.positionY,
          };
        } catch (e) {
          // ignore
        }
      }

      return {
        id: zone.id,
        name: zone.name,
        location: zone.location || `Зона ${zone.id}`,
        image: zone.image || "https://via.placeholder.com/800x400?text=Zone",
        description: zone.description || "",
        climate: zone.climate || "Неизвестно",
        hours: zone.hours || "9:00 – 19:00",
        position,
        animals: animalsWithPhotos,
        animalsCount: animalsWithPhotos.length,
      };
    }),
  );

  return {
    zones: zonesWithAnimals,
    total: zonesWithAnimals.length,
  };
}

// ==================== ПОЛУЧИТЬ ЗОНУ ПО ID ====================

export async function getZoneById(id: number) {
  const zone = await db.query.zones.findFirst({
    where: eq(zones.id, id),
  });

  if (!zone) {
    const error = new Error("Зона не найдена");
    (error as any).statusCode = 404;
    throw error;
  }

  // Получаем животных этой зоны
  const zoneAnimals = await db
    .select({
      id: animals.id,
      name: animals.name,
      species: animals.species,
      description: animals.description,
      rating: animals.rating,
    })
    .from(animals)
    .where(eq(animals.zoneId, zone.id));

  // Для каждого животного получаем фото
  const animalsWithPhotos = await Promise.all(
    zoneAnimals.map(async (animal) => {
      const photos = await db
        .select({
          id: animalPhotos.id,
          url: animalPhotos.url,
          isPrimary: animalPhotos.isPrimary,
        })
        .from(animalPhotos)
        .where(eq(animalPhotos.animalId, animal.id));

      const primaryPhoto = photos.find((p) => p.isPrimary) || photos[0];

      return {
        id: animal.id,
        name: animal.name,
        species: animal.species,
        description: animal.description,
        rating: Number(animal.rating) || 0,
        image: primaryPhoto?.url,
      };
    }),
  );

  // Парсим позицию
  let position = { x: zone.positionX, y: zone.positionY };
  if (zone.mapPosition) {
    try {
      const parsed = JSON.parse(zone.mapPosition);
      position = {
        x: parsed.x || zone.positionX,
        y: parsed.y || zone.positionY,
      };
    } catch (e) {
      // ignore
    }
  }

  return {
    id: zone.id,
    name: zone.name,
    location: zone.location || `Зона ${zone.id}`,
    image: zone.image || "https://via.placeholder.com/800x400?text=Zone",
    description: zone.description || "",
    climate: zone.climate || "Неизвестно",
    hours: zone.hours || "9:00 – 19:00",
    position,
    animals: animalsWithPhotos,
    animalsCount: animalsWithPhotos.length,
  };
}

// ==================== СОЗДАТЬ ЗОНУ ====================

export async function createZone(input: CreateZoneInput) {
  const {
    name,
    description,
    image,
    climate,
    hours,
    location,
    positionX,
    positionY,
  } = input;

  if (!name) {
    const error = new Error("Название зоны обязательно");
    (error as any).statusCode = 400;
    throw error;
  }

  const result = await db
    .insert(zones)
    .values({
      name,
      description: description || null,
      image: image || null,
      climate: climate || null,
      hours: hours || null,
      location: location || null,
      positionX: positionX || 50,
      positionY: positionY || 50,
      mapPosition: JSON.stringify({ x: positionX || 50, y: positionY || 50 }),
    })
    .returning();

  return result[0];
}

// ==================== ОБНОВИТЬ ЗОНУ ====================

export async function updateZone(id: number, input: UpdateZoneInput) {
  const existingZone = await db.query.zones.findFirst({
    where: eq(zones.id, id),
  });

  if (!existingZone) {
    const error = new Error("Зона не найдена");
    (error as any).statusCode = 404;
    throw error;
  }

  const updateData: any = {};

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.image !== undefined) updateData.image = input.image;
  if (input.climate !== undefined) updateData.climate = input.climate;
  if (input.hours !== undefined) updateData.hours = input.hours;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.positionX !== undefined) {
    updateData.positionX = input.positionX;
  }
  if (input.positionY !== undefined) {
    updateData.positionY = input.positionY;
  }

  // Обновляем mapPosition если изменилась позиция
  if (input.positionX !== undefined || input.positionY !== undefined) {
    updateData.mapPosition = JSON.stringify({
      x: input.positionX ?? existingZone.positionX,
      y: input.positionY ?? existingZone.positionY,
    });
  }

  const result = await db
    .update(zones)
    .set(updateData)
    .where(eq(zones.id, id))
    .returning();

  return result[0];
}

// ==================== УДАЛИТЬ ЗОНУ ====================

export async function deleteZone(id: number) {
  const zone = await db.query.zones.findFirst({
    where: eq(zones.id, id),
  });

  if (!zone) {
    const error = new Error("Зона не найдена");
    (error as any).statusCode = 404;
    throw error;
  }

  await db.delete(zones).where(eq(zones.id, id));

  return { message: "Зона удалена" };
}
