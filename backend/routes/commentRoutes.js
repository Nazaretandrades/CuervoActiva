// Importamos Express para poder usar su sistema de enrutamiento
const express = require("express");

// Creamos una nueva instancia de router
// Este router manejará todas las rutas relacionadas con los comentarios de eventos.
const router = express.Router();

// Importamos las funciones (controladores) que contienen la lógica principal
const { addComment, getComments } = require("../controllers/commentController");
// Importamos los middlewares de autenticación y autorización
const { auth, authorizeRoles } = require("../middlewares/authMiddleware");

/*
 * RUTA: POST /api/comments/:eventId
 * Agrega un nuevo comentario o valoración a un evento específico.
 * - Requiere autenticación (solo usuarios logueados pueden comentar).
 */
router.post("/:eventId", auth, addComment);

/**
 * RUTA: GET /api/comments/:eventId
 * Obtiene todos los comentarios asociados a un evento específico.
 * - Esta ruta es pública (no requiere autenticación).
 */
router.get("/:eventId", getComments);

/**
 * Exportación del router
 * Esto permite que este módulo sea importado y utilizado en "server.js" o en el archivo principal de rutas.
 */
module.exports = router;
