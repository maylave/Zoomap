import { eq, count, sql, desc, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  users,
  animals,
  events,
  zones,
  ticketBookings,
  reviews,
  animalPhotos,
  ticketTypes,
  zooTicketTypes,
  workingHours,
  photoAlbums,
  photos,
  tickerItems,
  bookingTickets,
} from "../db/schema.js";

// ==================== ДАШБОРД ====================

export async function getDashboardStats() {
  const usersCountResult = await db.select({ count: count() }).from(users);
  const animalsCountResult = await db.select({ count: count() }).from(animals);
  const eventsCountResult = await db.select({ count: count() }).from(events);
  const zonesCountResult = await db.select({ count: count() }).from(zones);
  const bookingsCountResult = await db
    .select({ count: count() })
    .from(ticketBookings);
  const reviewsCountResult = await db.select({ count: count() }).from(reviews);

  const today = new Date().toISOString().split("T")[0]!;
  const todayRevenueResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${ticketBookings.totalPrice}), 0)`,
    })
    .from(ticketBookings)
    .where(eq(ticketBookings.visitDate, today));

  const popularAnimals = await db.query.animals.findMany({
    with: {
      zone: {
        columns: { name: true },
      },
    },
    orderBy: desc(animals.rating),
    limit: 5,
  });

  const recentBookings = await db.query.ticketBookings.findMany({
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
      tickets: {
        with: {
          ticketType: {
            columns: { name: true },
          },
        },
      },
    },
    orderBy: desc(ticketBookings.createdAt),
    limit: 10,
  });

  return {
    users: usersCountResult[0]?.count || 0,
    animals: animalsCountResult[0]?.count || 0,
    events: eventsCountResult[0]?.count || 0,
    zones: zonesCountResult[0]?.count || 0,
    bookings: bookingsCountResult[0]?.count || 0,
    reviews: reviewsCountResult[0]?.count || 0,
    todayRevenue: todayRevenueResult[0]?.total || 0,
    popularAnimals,
    recentBookings,
  };
}

// ==================== ПОЛЬЗОВАТЕЛИ ====================

export async function getAllUsers() {
  return await db.query.users.findMany({
    orderBy: desc(users.createdAt),
  });
}

export async function getUserById(id: number) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      reviews: {
        with: {
          animal: {
            columns: { id: true, name: true },
          },
        },
      },
      ticketBookings: {
        columns: {
          id: true,
          visitDate: true,
          totalPrice: true,
          status: true,
        },
      },
    },
  });
}

export async function updateUserRole(
  id: number,
  role: "user" | "admin" | "dev",
) {
  const result = await db
    .update(users)
    .set({ role })
    .where(eq(users.id, id))
    .returning();

  return result[0];
}

export async function deleteUser(id: number) {
  await db.delete(users).where(eq(users.id, id));
  return { message: "Пользователь удалён" };
}

// ==================== ЖИВОТНЫЕ ====================

export async function getAllAnimals() {
  return await db.query.animals.findMany({
    with: {
      zone: {
        columns: { id: true, name: true },
      },
      photos: {
        columns: { id: true, url: true, isPrimary: true },
      },
    },
    orderBy: asc(animals.name),
  });
}

export async function getAnimalById(id: number) {
  return await db.query.animals.findFirst({
    where: eq(animals.id, id),
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
}

export async function createAnimal(data: {
  zoneId: number;
  name: string;
  species: string;
  diet: "хищник" | "травоядное" | "всеядное";
  weight?: number;
  age?: number;
  description?: string;
}) {
  const result = await db.insert(animals).values(data).returning();

  return result[0];
}

export async function updateAnimal(
  id: number,
  data: Partial<typeof animals.$inferInsert>,
) {
  const result = await db
    .update(animals)
    .set(data)
    .where(eq(animals.id, id))
    .returning();

  return result[0];
}

export async function deleteAnimal(id: number) {
  await db.delete(animals).where(eq(animals.id, id));
  return { message: "Животное удалено" };
}

// ==================== ЗОНЫ ====================

export async function getAllZones() {
  return await db.query.zones.findMany({
    orderBy: asc(zones.name),
  });
}

export async function createZone(data: {
  name: string;
  description?: string;
  mapPosition?: string;
}) {
  const result = await db.insert(zones).values(data).returning();

  return result[0];
}

export async function updateZone(
  id: number,
  data: Partial<typeof zones.$inferInsert>,
) {
  const result = await db
    .update(zones)
    .set(data)
    .where(eq(zones.id, id))
    .returning();

  return result[0];
}

export async function deleteZone(id: number) {
  await db.delete(zones).where(eq(zones.id, id));
  return { message: "Зона удалена" };
}

// ==================== СОБЫТИЯ ====================

export async function getAllEvents() {
  return await db.query.events.findMany({
    with: {
      creator: {
        columns: { id: true, name: true },
      },
    },
    orderBy: asc(events.date),
  });
}

export async function createEvent(data: typeof events.$inferInsert) {
  const result = await db.insert(events).values(data).returning();

  return result[0];
}

export async function updateEvent(
  id: number,
  data: Partial<typeof events.$inferInsert>,
) {
  const result = await db
    .update(events)
    .set(data)
    .where(eq(events.id, id))
    .returning();

  return result[0];
}

export async function deleteEvent(id: number) {
  await db.delete(events).where(eq(events.id, id));
  return { message: "Событие удалено" };
}

// ==================== БРОНИРОВАНИЯ ====================

export async function getAllBookings() {
  return await db.query.ticketBookings.findMany({
    with: {
      user: {
        columns: { id: true, name: true, email: true },
      },
      tickets: {
        with: {
          ticketType: {
            columns: { name: true, price: true },
          },
        },
      },
    },
    orderBy: desc(ticketBookings.createdAt),
  });
}

export async function getBookingById(id: number) {
  return await db.query.ticketBookings.findFirst({
    where: eq(ticketBookings.id, id),
    with: {
      user: true,
      tickets: {
        with: {
          ticketType: true,
        },
      },
    },
  });
}

export async function updateBookingStatus(id: number, status: string) {
  const result = await db
    .update(ticketBookings)
    .set({ status })
    .where(eq(ticketBookings.id, id))
    .returning();

  return result[0];
}

export async function deleteBooking(id: number) {
  await db.delete(ticketBookings).where(eq(ticketBookings.id, id));
  return { message: "Бронирование удалено" };
}

// ==================== ОТЗЫВЫ ====================

export async function getAllReviews() {
  return await db.query.reviews.findMany({
    with: {
      user: {
        columns: { id: true, name: true },
      },
      animal: {
        columns: { id: true, name: true },
      },
    },
    orderBy: desc(reviews.createdAt),
  });
}

export async function deleteReview(id: number) {
  await db.delete(reviews).where(eq(reviews.id, id));
  return { message: "Отзыв удалён" };
}

// ==================== ТИПЫ БИЛЕТОВ ====================

export async function getAllZooTicketTypes() {
  return await db.query.zooTicketTypes.findMany({
    orderBy: asc(zooTicketTypes.price),
  });
}

export async function createZooTicketType(
  data: typeof zooTicketTypes.$inferInsert,
) {
  const result = await db.insert(zooTicketTypes).values(data).returning();

  return result[0];
}

export async function updateZooTicketType(
  id: number,
  data: Partial<typeof zooTicketTypes.$inferInsert>,
) {
  const result = await db
    .update(zooTicketTypes)
    .set(data)
    .where(eq(zooTicketTypes.id, id))
    .returning();

  return result[0];
}

export async function deleteZooTicketType(id: number) {
  await db.delete(zooTicketTypes).where(eq(zooTicketTypes.id, id));
  return { message: "Тип билета удалён" };
}

// ==================== РАСПИСАНИЕ ====================

export async function getAllWorkingHours() {
  return await db.query.workingHours.findMany({
    orderBy: asc(workingHours.id),
  });
}

export async function createWorkingHour(
  data: typeof workingHours.$inferInsert,
) {
  const result = await db.insert(workingHours).values(data).returning();

  return result[0];
}

export async function updateWorkingHour(
  id: number,
  data: Partial<typeof workingHours.$inferInsert>,
) {
  const result = await db
    .update(workingHours)
    .set(data)
    .where(eq(workingHours.id, id))
    .returning();

  return result[0];
}

export async function deleteWorkingHour(id: number) {
  await db.delete(workingHours).where(eq(workingHours.id, id));
  return { message: "Расписание удалено" };
}

// ==================== БЕГУЩАЯ СТРОКА ====================

export async function getAllTickerItems() {
  return await db.query.tickerItems.findMany({
    with: {
      zone: {
        columns: { id: true, name: true },
      },
    },
    orderBy: asc(tickerItems.displayOrder),
  });
}

export async function createTickerItem(data: typeof tickerItems.$inferInsert) {
  const result = await db.insert(tickerItems).values(data).returning();

  return result[0];
}

export async function updateTickerItem(
  id: number,
  data: Partial<typeof tickerItems.$inferInsert>,
) {
  const result = await db
    .update(tickerItems)
    .set(data)
    .where(eq(tickerItems.id, id))
    .returning();

  return result[0];
}

export async function deleteTickerItem(id: number) {
  await db.delete(tickerItems).where(eq(tickerItems.id, id));
  return { message: "Элемент удалён" };
}

// ==================== ФОТОАЛЬБОМЫ ====================

export async function getAllPhotoAlbums() {
  return await db.query.photoAlbums.findMany({
    with: {
      event: {
        columns: { id: true, title: true },
      },
      creator: {
        columns: { id: true, name: true },
      },
    },
    orderBy: desc(photoAlbums.createdAt),
  });
}

export async function deletePhotoAlbum(id: number) {
  await db.delete(photoAlbums).where(eq(photoAlbums.id, id));
  return { message: "Альбом удалён" };
}

// ==================== ФОТОГРАФИИ ====================

export async function getAllPhotos() {
  return await db.query.photos.findMany({
    with: {
      album: {
        columns: { id: true, title: true },
      },
      uploader: {
        columns: { id: true, name: true },
      },
    },
    orderBy: desc(photos.uploadedAt),
    limit: 100,
  });
}

export async function deletePhoto(id: number) {
  await db.delete(photos).where(eq(photos.id, id));
  return { message: "Фото удалено" };
}
