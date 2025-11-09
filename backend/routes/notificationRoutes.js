// backend/routes/notificationRoutes.js
import express from "express";
import { listNotifications, deleteNotification } from "../controllers/notificationController.js";
import { auth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// 📬 Obtener todas las notificaciones
router.get("/", auth, listNotifications);

// 🗑️ Eliminar una notificación
router.delete("/:id", auth, deleteNotification);

export default router;
