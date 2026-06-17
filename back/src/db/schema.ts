import {
  pgTable,
  serial,
  varchar,
  integer,
  decimal,
  timestamp,
  pgEnum,
  boolean,
  text,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== ENUM ====================
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "dev"]);
export const animalDietEnum = pgEnum("animal_diet", [
  "хищник",
  "травоядное",
  "всеядное",
]);

// ==================== ENUM ДЛЯ ПРОМОКОДОВ ====================
export const promoDiscountTypeEnum = pgEnum("promo_discount_type", [
  "percent",
  "fixed",
]);

export const promoStatusEnum = pgEnum("promo_status", [
  "active",
  "inactive",
  "expired",
]);

export const userPromoStatusEnum = pgEnum("user_promo_status", [
  "available",
  "used",
  "expired",
]);

export const promoSourceEnum = pgEnum("promo_source", [
  "subscription",
  "birthday",
  "event",
  "purchase",
  "manual",
  "registration",
]);

// ==================== ПОЛЬЗОВАТЕЛИ ====================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  login: varchar("login", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// ==================== ЗООНЫ ====================
export const zones = pgTable("zones", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  mapPosition: varchar("map_position", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== ЖИВОТНЫЕ ====================
export const animals = pgTable("animals", {
  id: serial("id").primaryKey(),
  zoneId: integer("zone_id")
    .notNull()
    .references(() => zones.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  species: varchar("species", { length: 100 }).notNull(),
  diet: animalDietEnum("diet").notNull(),
  weight: integer("weight"),
  age: integer("age"),
  description: text("description"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewsCount: integer("reviews_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== ФОТО ЖИВОТНЫХ ====================
export const animalPhotos = pgTable("animal_photos", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id")
    .notNull()
    .references(() => animals.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 255 }).notNull(),
  altText: varchar("alt_text", { length: 255 }).notNull(),
  isPrimary: boolean("is_primary").default(false),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// ==================== ОТЗЫВЫ ====================
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  animalId: integer("animal_id")
    .notNull()
    .references(() => animals.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== МЕРОПРИЯТИЯ ====================
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("event_date").notNull(),
  day: integer("day").notNull(),
  month: varchar("month", { length: 20 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  category: varchar("category", { length: 100 }).notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  priceLabel: varchar("price_label", { length: 100 }),
  buttonText: varchar("button_text", { length: 50 }).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== ТИПЫ БИЛЕТОВ (для мероприятий) ====================
export const ticketTypes = pgTable("ticket_types", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  available: integer("available").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== ПОКУПКИ БИЛЕТОВ (для мероприятий) ====================
export const ticketPurchases = pgTable("ticket_purchases", {
  id: serial("id").primaryKey(),
  ticketTypeId: integer("ticket_type_id")
    .notNull()
    .references(() => ticketTypes.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});

// ==================== ТИПЫ БИЛЕТОВ В ЗООПАРК ====================
export const zooTicketTypes = pgTable("zoo_ticket_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }),
  price: integer("price").notNull(),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  maxQuantity: integer("max_quantity"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== РАСПИСАНИЕ РАБОТЫ ====================
export const workingHours = pgTable("working_hours", {
  id: serial("id").primaryKey(),
  daysOfWeek: varchar("days_of_week", { length: 50 }).notNull(),
  openTime: varchar("open_time", { length: 10 }).notNull(),
  closeTime: varchar("close_time", { length: 10 }).notNull(),
  scheduleType: varchar("schedule_type", { length: 50 })
    .notNull()
    .default("regular"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== БРОНИРОВАНИЕ БИЛЕТОВ В ЗООПАРК ====================
export const ticketBookings = pgTable("ticket_bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  visitDate: date("visit_date").notNull(),
  visitTime: varchar("visit_time", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  totalPrice: integer("total_price").notNull(),
  paymentId: varchar("payment_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== БИЛЕТЫ В БРОНИРОВАНИИ ====================
export const bookingTickets = pgTable("booking_tickets", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id")
    .notNull()
    .references(() => ticketBookings.id, { onDelete: "cascade" }),
  ticketTypeId: integer("ticket_type_id")
    .notNull()
    .references(() => zooTicketTypes.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

// ==================== 📧 ПОДПИСКИ НА НОВОСТИ ====================
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribe: boolean("subscribe").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// ==================== ФОТОАЛЬБОМЫ ====================
export const photoAlbums = pgTable("photo_albums", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  coverPhotoUrl: varchar("cover_photo_url", { length: 500 }),
  isPublic: boolean("is_public").notNull().default(true),
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== ФОТОГРАФИИ В АЛЬБОМАХ (УПРОЩЁННАЯ) ====================
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  albumId: integer("album_id")
    .notNull()
    .references(() => photoAlbums.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 500 }).notNull(),
  caption: varchar("caption", { length: 500 }),
  altText: varchar("alt_text", { length: 255 }),
  uploadedBy: integer("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// ==================== 🎫 ПРОМОКОДЫ (общие, создаются админом) ====================
export const promocodes = pgTable("promocodes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  discount: integer("discount").notNull(),
  discountType: promoDiscountTypeEnum("discount_type").notNull(),
  description: text("description"),
  status: promoStatusEnum("status").notNull().default("active"),

  // Ограничения использования
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),

  // Временные рамки
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),

  // Минимальная сумма заказа
  minOrderAmount: integer("min_order_amount"),

  // Кто создал
  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

// ==================== 🎟️ ПРОМОКОДЫ ПОЛЬЗОВАТЕЛЕЙ ====================
export const userPromocodes = pgTable("user_promocodes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  promocodeId: integer("promocode_id")
    .notNull()
    .references(() => promocodes.id, { onDelete: "cascade" }),

  status: userPromoStatusEnum("status").notNull().default("available"),
  source: promoSourceEnum("source").notNull(),

  // Временные метки
  grantedAt: timestamp("granted_at").defaultNow().notNull(),
  activatedAt: timestamp("activated_at"),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at").notNull(),

  // Информация об использовании
  orderId: varchar("order_id", { length: 100 }),
  orderType: varchar("order_type", { length: 50 }),
  discountAmount: integer("discount_amount"),
});

// ==================== БЕГУЩАЯ СТРОКА ====================
export const tickerItems = pgTable("ticker_items", {
  id: serial("id").primaryKey(),
  zoneId: integer("zone_id").references(() => zones.id, {
    onDelete: "cascade",
  }),
  text: varchar("text", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  link: varchar("link", { length: 500 }),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  speed: integer("speed").notNull().default(30),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== СВЯЗИ ====================

export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
  ticketBookings: many(ticketBookings),
  createdAlbums: many(photoAlbums),
  uploadedPhotos: many(photos),
  createdPromocodes: many(promocodes),
  userPromocodes: many(userPromocodes),
}));

export const zonesRelations = relations(zones, ({ many }) => ({
  animals: many(animals),
  tickerItems: many(tickerItems),
}));

export const animalsRelations = relations(animals, ({ one, many }) => ({
  zone: one(zones, {
    fields: [animals.zoneId],
    references: [zones.id],
  }),
  photos: many(animalPhotos),
  reviews: many(reviews),
}));

export const animalPhotosRelations = relations(animalPhotos, ({ one }) => ({
  animal: one(animals, {
    fields: [animalPhotos.animalId],
    references: [animals.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  animal: one(animals, {
    fields: [reviews.animalId],
    references: [animals.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  ticketTypes: many(ticketTypes),
  photoAlbums: many(photoAlbums),
}));

export const ticketTypesRelations = relations(ticketTypes, ({ one, many }) => ({
  event: one(events, {
    fields: [ticketTypes.eventId],
    references: [events.id],
  }),
  purchases: many(ticketPurchases),
}));

export const ticketPurchasesRelations = relations(
  ticketPurchases,
  ({ one }) => ({
    ticketType: one(ticketTypes, {
      fields: [ticketPurchases.ticketTypeId],
      references: [ticketTypes.id],
    }),
    user: one(users, {
      fields: [ticketPurchases.userId],
      references: [users.id],
    }),
  }),
);

export const zooTicketTypesRelations = relations(
  zooTicketTypes,
  ({ many }) => ({
    bookingTickets: many(bookingTickets),
  }),
);

export const workingHoursRelations = relations(workingHours, () => ({}));

export const ticketBookingsRelations = relations(
  ticketBookings,
  ({ one, many }) => ({
    user: one(users, {
      fields: [ticketBookings.userId],
      references: [users.id],
    }),
    tickets: many(bookingTickets),
  }),
);

export const bookingTicketsRelations = relations(bookingTickets, ({ one }) => ({
  booking: one(ticketBookings, {
    fields: [bookingTickets.bookingId],
    references: [ticketBookings.id],
  }),
  ticketType: one(zooTicketTypes, {
    fields: [bookingTickets.ticketTypeId],
    references: [zooTicketTypes.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, () => ({}));

export const photoAlbumsRelations = relations(photoAlbums, ({ one, many }) => ({
  event: one(events, {
    fields: [photoAlbums.eventId],
    references: [events.id],
  }),
  creator: one(users, {
    fields: [photoAlbums.createdBy],
    references: [users.id],
  }),
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  album: one(photoAlbums, {
    fields: [photos.albumId],
    references: [photoAlbums.id],
  }),
  uploader: one(users, {
    fields: [photos.uploadedBy],
    references: [users.id],
  }),
}));

export const promocodesRelations = relations(promocodes, ({ one, many }) => ({
  creator: one(users, {
    fields: [promocodes.createdBy],
    references: [users.id],
  }),
  userPromocodes: many(userPromocodes),
}));

export const userPromocodesRelations = relations(userPromocodes, ({ one }) => ({
  user: one(users, {
    fields: [userPromocodes.userId],
    references: [users.id],
  }),
  promocode: one(promocodes, {
    fields: [userPromocodes.promocodeId],
    references: [promocodes.id],
  }),
}));

export const tickerItemsRelations = relations(tickerItems, ({ one }) => ({
  zone: one(zones, {
    fields: [tickerItems.zoneId],
    references: [zones.id],
  }),
}));
