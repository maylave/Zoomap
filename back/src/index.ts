import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

// Роуты
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import animalRoutes from "./routes/animal.routes.js";
import eventRoutes from "./routes/event.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы (загрузки)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==================== РОУТЫ ====================

// Публичные роуты
app.use("/auth", authRoutes);
app.use("/animals", animalRoutes);
app.use("/events", eventRoutes);
app.use("/tickets", ticketRoutes);
app.use("/gallery", galleryRoutes); // ✅ ИСПРАВЛЕНО!

// Защищённые роуты (требуют авторизации)
app.use("/profile", profileRoutes);
app.use("/subscription", subscriptionRoutes);

// Админ роуты (требуют прав админа)
app.use("/admin", adminRoutes);

// Root
app.get("/", (req, res) => {
  res.json({
    message: "ZooVerse API работает!",
    docs: "http://localhost:3000/api-docs",
    version: "1.0.0",
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
    });
  },
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🖼️  Gallery API: http://localhost:${PORT}/gallery`);
  console.log(`🎫 Tickets API: http://localhost:${PORT}/tickets`);
  console.log(`👤 Profile API: http://localhost:${PORT}/profile`);
  console.log(`👨‍💼 Admin API: http://localhost:${PORT}/admin`);
});
