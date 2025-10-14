//Importamos Express para poder usar su sistema de enrutamiento
const express = require("express");

//Creamos una nueva instancia de router.
//Este router manejará todas las rutas relacionadas con los comentarios.
const router = express.Router();

//Importamos las funciones (controladores) que gestionan la lógica principal
const { addComment, getComments } = require("../controllers/commentController");

//Importamos los middlewares de autenticación y autorización
const { auth, authorizeRoles } = require("../middlewares/authMiddleware");

/**
 * RUTA: POST /api/comments/:eventId
 * Agrega un nuevo comentario a un evento específico.
 */
router.post("/:eventId", auth, addComment);

/**
 * RUTA: GET /api/comments/:eventId
 * Obtiene todos los comentarios de un evento específico.
 */
router.get("/:eventId", getComments);

/**
 * Exportación del router
 * Esto permite que este archivo sea importado en "server.js"
 */
module.exports = router;
