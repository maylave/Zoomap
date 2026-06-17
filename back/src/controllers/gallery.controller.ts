import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { photos, photoAlbums } from "../db/schema.js";

// ==================== ТИПЫ ====================

export interface CreatePhotoInput {
  albumId: number;
  url: string;
  caption?: string;
  altText?: string;
}

export interface UpdatePhotoInput {
  albumId?: number;
  url?: string;
  caption?: string;
  altText?: string;
}

// ==================== ПОЛУЧИТЬ ВСЕ ФОТО ====================

export async function getAllPhotos(query: any) {
  const { albumId, limit = 50, offset = 0 } = query;

  const whereConditions: any[] = [];

  if (albumId) {
    whereConditions.push(eq(photos.albumId, Number(albumId)));
  }

  const photosList = await db.query.photos.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    with: {
      album: {
        columns: {
          id: true,
          title: true,
        },
      },
      uploader: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(photos.uploadedAt)],
    limit: Number(limit),
    offset: Number(offset),
  });

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(photos)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

  return {
    photos: photosList,
    total: Number(total[0]?.count || 0),
    limit: Number(limit),
    offset: Number(offset),
  };
}

// ==================== ПОЛУЧИТЬ ФОТО ПО ID ====================

export async function getPhotoById(id: number) {
  const photo = await db.query.photos.findFirst({
    where: eq(photos.id, id),
    with: {
      album: {
        columns: {
          id: true,
          title: true,
          description: true,
        },
      },
      uploader: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!photo) {
    const error = new Error("Фото не найдено");
    (error as any).statusCode = 404;
    throw error;
  }

  return photo;
}

// ==================== СОЗДАТЬ ФОТО ====================

export async function createPhoto(input: CreatePhotoInput) {
  const { albumId, url, caption, altText } = input;

  // Проверка что альбом существует
  const album = await db.query.photoAlbums.findFirst({
    where: eq(photoAlbums.id, albumId),
  });

  if (!album) {
    const error = new Error("Альбом не найден");
    (error as any).statusCode = 404;
    throw error;
  }

  // В реальном приложении здесь нужно получить userId из токена
  // Для примера берём первого админа или используем 1
  const uploadedBy = 1; // TODO: заменить на req.user!.id

  const result = await db
    .insert(photos)
    .values({
      albumId,
      url,
      caption: caption || null,
      altText: altText || null,
      uploadedBy,
    })
    .returning();

  return result[0];
}

// ==================== ОБНОВИТЬ ФОТО ====================

export async function updatePhoto(id: number, input: UpdatePhotoInput) {
  const { albumId, url, caption, altText } = input;

  // Проверяем существует ли фото
  const existingPhoto = await db.query.photos.findFirst({
    where: eq(photos.id, id),
  });

  if (!existingPhoto) {
    const error = new Error("Фото не найдено");
    (error as any).statusCode = 404;
    throw error;
  }

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (albumId !== undefined) {
    // Проверяем что альбом существует
    const album = await db.query.photoAlbums.findFirst({
      where: eq(photoAlbums.id, albumId),
    });

    if (!album) {
      const error = new Error("Альбом не найден");
      (error as any).statusCode = 404;
      throw error;
    }

    updateData.albumId = albumId;
  }

  if (url !== undefined) updateData.url = url;
  if (caption !== undefined) updateData.caption = caption;
  if (altText !== undefined) updateData.altText = altText;

  const result = await db
    .update(photos)
    .set(updateData)
    .where(eq(photos.id, id))
    .returning();

  return result[0];
}

// ==================== УДАЛИТЬ ФОТО ====================

export async function deletePhoto(id: number) {
  const photo = await db.query.photos.findFirst({
    where: eq(photos.id, id),
  });

  if (!photo) {
    const error = new Error("Фото не найдено");
    (error as any).statusCode = 404;
    throw error;
  }

  await db.delete(photos).where(eq(photos.id, id));

  return { message: "Фото удалено" };
}
