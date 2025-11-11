// Importamos Express para poder crear el enrutador
import express from "express";

// Importamos las funciones del controlador que manejan la lógica de las notificaciones
import {
  listNotifications,
  deleteNotification,
} from "../controllers/notificationController.js";

// Importamos el middleware de autenticación
// Solo los usuarios autenticados pueden ver o eliminar sus notificaciones
import { auth } from "../middlewares/authMiddleware.js";

// Creamos una nueva instancia del router
const router = express.Router();

/**
 * RUTA: GET /api/notifications
 * Devuelve todas las notificaciones del usuario autenticado.
 * - Requiere autenticación.
 */
router.get("/", auth, listNotifications);

/**
 * RUTA: DELETE /api/notifications/:id
 * Elimina una notificación específica por su ID.
 * - Requiere autenticación.
 */
router.delete("/:id", auth, deleteNotification);

/**
 * Exportamos el router
 * Esto permite importarlo y usarlo en el servidor principal ("server.js").
 */
export default router;
