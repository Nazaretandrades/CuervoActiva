//Importamos Express para poder usar su sistema de enrutamiento
const express = require("express");

//Creamos una instancia de router, que agrupa todas las rutas relacionadas con las notificaciones
const router = express.Router();

//Importamos los controladores que contienen la lógica de cada operación
//- listNotifications -> obtiene todas las notificaciones de un usuario
//- markAsRead -> marca una notificación como leída
const {
  listNotifications,
  markAsRead,
} = require("../controllers/notificationController");

//Importamos los middlewares de autenticación
const { auth, authorizeRoles } = require("../middlewares/authMiddleware");

/**
 * RUTA: GET /api/notifications
 * Devuelve todas las notificaciones del usuario autenticado.
 */
router.get("/", auth, listNotifications);

/**
 * RUTA: PUT /api/notifications/:id/read
 * Marca una notificación específica como leída.
 */
router.put("/:id/read", auth, markAsRead);

/**
 * Exportamos el router
 * Esto permite que el archivo sea importado en "server.js"
 */
module.exports = router;
