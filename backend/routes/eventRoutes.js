//Importamos Express para poder crear un router de rutas
const express = require("express");

//Creamos una instancia de Router, que nos permite definir las rutas de este módulo
const router = express.Router();

//Importamos las funciones (controladores) que manejarán la lógica de cada ruta
//Cada una de estas funciones se encarga de interactuar con la base de datos
//(buscar, crear, editar o eliminar eventos)
const {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

//Importamos los middlewares de autenticación y autorización
//- "auth" → verifica si el usuario está autenticado mediante un token JWT
//- "authorizeRoles" → restringe el acceso a ciertos roles (admin, organizer, etc.)
const { auth, authorizeRoles } = require("../middlewares/authMiddleware");

/**
 * RUTA: GET /api/events
 * Devuelve la lista de todos los eventos disponibles.
 */
router.get("/", listEvents);

/**
 *  RUTA: GET /api/events/:id
 *  Devuelve la información detallada de un evento específico según su ID.
 */
router.get("/:id", getEvent);

/**
 * RUTA: POST /api/events
 * Crea un nuevo evento en la base de datos.
 */
router.post("/", auth, authorizeRoles("organizer"), createEvent);

/**
 * RUTA: PUT /api/events/:id
 * Actualiza un evento existente según su ID.
 */
router.put("/:id", auth, authorizeRoles("admin", "organizer"), updateEvent);

/**
 * RUTA: DELETE /api/events/:id
 * Elimina un evento de la base de datos.
 */
router.delete("/:id", auth, authorizeRoles("admin"), deleteEvent);

/**
 * Exportamos el router
 * Esto permite que el archivo sea usado en "server.js"
 */
module.exports = router;
