const express = require("express");
const router = express.Router();

const {
  listEvents,
  listOrganizerEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

// Importamos los middlewares de autenticación y control de roles
const { auth, authorizeRoles } = require("../middlewares/authMiddleware");

// Middleware para la carga de imágenes de eventos
const upload = require("../middlewares/uploadMiddleware");

/**
 * RUTA: POST /api/events/upload
 * Permite a los organizadores subir una imagen para su evento.
 * - Requiere autenticación.
 * - Solo disponible para usuarios con rol "organizer".
 * - Devuelve la URL pública de la imagen subida.
 */
router.post(
  "/upload",
  auth,
  authorizeRoles("organizer", "admin"),
  upload.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No se subió imagen" });

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    res.json({ image_url: imageUrl });
  }
);

/**
 * RUTA: GET /api/events/organizer
 * Devuelve todos los eventos creados por el organizador autenticado.
 * - Requiere autenticación.
 * - Solo accesible para roles "organizer" y "admin".
 */
router.get(
  "/organizer",
  auth,
  authorizeRoles("organizer", "admin"),
  listOrganizerEvents
);

/**
 * RUTA: GET /api/events
 * Devuelve la lista de todos los eventos disponibles.
 * - Ruta pública (sin autenticación).
 */
router.get("/", listEvents);

/**
 * RUTA: GET /api/events/:id
 * Devuelve el detalle de un evento específico según su ID.
 * - Ruta pública (sin autenticación).
 */
router.get("/:id", getEvent);

/**
 * RUTA: POST /api/events
 * Crea un nuevo evento.
 * - Requiere autenticación.
 * - Solo los usuarios con rol "organizer" pueden crear eventos.
 */
router.post("/", auth, authorizeRoles("organizer", "admin"), createEvent);

/**
 * RUTA: PUT /api/events/:id
 * Permite editar un evento existente.
 * - Requiere autenticación.
 * - Los organizadores pueden editar los suyos.
 * - Los administradores pueden editar cualquiera.
 */
router.put("/:id", auth, authorizeRoles("organizer", "admin"), updateEvent);

/**
 * RUTA: DELETE /api/events/:id
 * Elimina un evento.
 * - Requiere autenticación.
 * - Solo los administradores pueden eliminar eventos.
 */
router.delete("/:id", auth, authorizeRoles("admin"), deleteEvent);

/**
 * Exportación del router
 * Este archivo se importa en el servidor principal ("server.js").
 */
module.exports = router;
