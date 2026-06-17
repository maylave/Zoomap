import { Router } from "express";
import type { Request, Response } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { upload } from "../utils/upload.js";

const router = Router();

// Все роуты требуют авторизации и прав админа
router.use(authenticate);
router.use(requireAdmin);

// ==================== ДАШБОРД ====================

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Статистика дашборда
 *     tags: [Admin - Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get("/dashboard", async (_req: Request, res: Response) => {
  try {
    const stats = await adminController.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ПОЛЬЗОВАТЕЛИ ====================

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Все пользователи
 *     tags: [Admin - Users]
 *     security:
 *       - bearerAuth: []
 */
router.get("/users", async (_req: Request, res: Response) => {
  try {
    const usersList = await adminController.getAllUsers();
    res.json(usersList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await adminController.getUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "Не найден" });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/users/:id/role", async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const user = await adminController.updateUserRole(
      Number(req.params.id),
      role,
    );
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    await adminController.deleteUser(Number(req.params.id));
    res.json({ message: "Удалён" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ЖИВОТНЫЕ ====================

/**
 * @swagger
 * /admin/animals:
 *   get:
 *     summary: Все животные
 *     tags: [Admin - Animals]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Создать животное
 *     tags: [Admin - Animals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [zoneId, name, species, diet]
 *             properties:
 *               zoneId: { type: integer }
 *               name: { type: string }
 *               species: { type: string }
 *               diet: { type: string, enum: [хищник, травоядное, всеядное] }
 *               weight: { type: integer }
 *               age: { type: integer }
 *               description: { type: string }
 */
router.get("/animals", async (_req: Request, res: Response) => {
  try {
    const animalsList = await adminController.getAllAnimals();
    res.json(animalsList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/animals", async (req: Request, res: Response) => {
  try {
    const animal = await adminController.createAnimal(req.body);
    res.status(201).json(animal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/animals/:id", async (req: Request, res: Response) => {
  try {
    const animal = await adminController.updateAnimal(
      Number(req.params.id),
      req.body,
    );
    res.json(animal);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/animals/:id", async (req: Request, res: Response) => {
  try {
    await adminController.deleteAnimal(Number(req.params.id));
    res.json({ message: "Удалено" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ЗОНЫ ====================

/**
 * @swagger
 * /admin/zones:
 *   get:
 *     summary: Все зоны
 *     tags: [Admin - Zones]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Создать зону
 *     tags: [Admin - Zones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               mapPosition: { type: string }
 */
router.get("/zones", async (_req: Request, res: Response) => {
  try {
    const zonesList = await adminController.getAllZones();
    res.json(zonesList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/zones", async (req: Request, res: Response) => {
  try {
    const zone = await adminController.createZone(req.body);
    res.status(201).json(zone);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/zones/:id", async (req: Request, res: Response) => {
  try {
    const zone = await adminController.updateZone(
      Number(req.params.id),
      req.body,
    );
    res.json(zone);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/zones/:id", async (req: Request, res: Response) => {
  try {
    await adminController.deleteZone(Number(req.params.id));
    res.json({ message: "Удалено" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== СОБЫТИЯ ====================

router.get("/events", async (_req: Request, res: Response) => {
  try {
    const eventsList = await adminController.getAllEvents();
    res.json(eventsList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/events", async (req: Request, res: Response) => {
  try {
    const event = await adminController.createEvent(req.body);
    res.status(201).json(event);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/events/:id", async (req: Request, res: Response) => {
  try {
    const event = await adminController.updateEvent(
      Number(req.params.id),
      req.body,
    );
    res.json(event);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/events/:id", async (req: Request, res: Response) => {
  try {
    await adminController.deleteEvent(Number(req.params.id));
    res.json({ message: "Удалено" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== БРОНИРОВАНИЯ ====================

router.get("/bookings", async (_req: Request, res: Response) => {
  try {
    const bookingsList = await adminController.getAllBookings();
    res.json(bookingsList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/bookings/:id", async (req: Request, res: Response) => {
  try {
    const booking = await adminController.getBookingById(Number(req.params.id));
    if (!booking) return res.status(404).json({ error: "Не найдено" });
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/bookings/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const booking = await adminController.updateBookingStatus(
      Number(req.params.id),
      status,
    );
    res.json(booking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/bookings/:id", async (req: Request, res: Response) => {
  try {
    await adminController.deleteBooking(Number(req.params.id));
    res.json({ message: "Удалено" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ОТЗЫВЫ ====================

router.get("/reviews", async (_req: Request, res: Response) => {
  try {
    const reviewsList = await adminController.getAllReviews();
    res.json(reviewsList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/reviews/:id", async (req: Request, res: Response) => {
  try {
    await adminController.deleteReview(Number(req.params.id));
    res.json({ message: "Удалено" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ТИПЫ БИЛЕТОВ (в зоопарк) ====================

/**
 * @swagger
 * /admin/ticket-types:
 *   get:
 *     summary: Все типы билетов
 *     tags: [Admin - Ticket Types]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Создать тип билета
 *     tags: [Admin - Ticket Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string, example: "Взрослый" }
 *               description: { type: string, example: "18-64 года" }
 *               price: { type: integer, example: 890 }
 *               minAge: { type: integer }
 *               maxAge: { type: integer }
 *               maxQuantity: { type: integer }
 */
router.get("/ticket-types", async (_req: Request, res: Response) => {
  try {
    const types = await adminController.getAllZooTicketTypes();
    res.json(types);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/ticket-types", async (req: Request, res: Response) => {
  try {
    const type = await adminController.createZooTicketType(req.body);
    res.status(201).json(type);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/ticket-types/:id", async (req: Request, res: Response) => {
  try {
    const type = await adminController.updateZooTicketType(
      Number(req.params.id),
      req.body,
    );
    res.json(type);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/ticket-types/:id", async (req: Request, res: Response) => {
  try {
    await adminController.deleteZooTicketType(Number(req.params.id));
    res.json({ message: "Удалено" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== РАСПИСАНИЕ ====================

router.get("/working-hours", async (_req: Request, res: Response) => {
  try {
    const hours = await adminController.getAllWorkingHours();
    res.json(hours);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/working-hours", async (req: Request, res: Response) => {
  try {
    const hour = await adminController.createWorkingHour(req.body);
    res.status(201).json(hour);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/working-hours/:id", async (req: Request, res: Response) => {
  try {
    const hour = await adminController.updateWorkingHour(
      Number(req.params.id),
      req.body,
    );
    res.json(hour);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/working-hours/:id", async (req: Request, res: Response) => {
  try {
    await adminController.deleteWorkingHour(Number(req.params.id));
    res.json({ message: "Удалено" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== БЕГУЩАЯ СТРОКА ====================

router.get("/ticker", async (_req: Request, res: Response) => {
  try {
    const items = await adminController.getAllTickerItems();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/ticker", async (req: Request, res: Response) => {
  try {
    const item = await adminController.createTickerItem(req.body);
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/ticker/:id", async (req: Request, res: Response) => {
  try {
    const item = await adminController.updateTickerItem(
      Number(req.params.id),
      req.body,
    );
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/ticker/:id", async (req: Request, res: Response) => {
  try {
    await adminController.deleteTickerItem(Number(req.params.id));
    res.json({ message: "Удалено" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ФОТОАЛЬБОМЫ ====================

router.get("/photo-albums", async (_req: Request, res: Response) => {
  try {
    const albums = await adminController.getAllPhotoAlbums();
    res.json(albums);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/photo-albums/:id", async (req: Request, res: Response) => {
  try {
    await adminController.deletePhotoAlbum(Number(req.params.id));
    res.json({ message: "Удалено" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== ФОТОГРАФИИ ====================

/**
 * @swagger
 * /admin/photos:
 *   get:
 *     summary: Все фото
 *     tags: [Admin - Photos]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Удалить фото
 *     tags: [Admin - Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get("/photos", async (_req: Request, res: Response) => {
  try {
    const photosList = await adminController.getAllPhotos();
    res.json(photosList);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/photos/:id", async (req: Request, res: Response) => {
  try {
    await adminController.deletePhoto(Number(req.params.id));
    res.json({ message: "Удалено" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
