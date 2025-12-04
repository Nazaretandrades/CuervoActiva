const express = require("express");

// Creamos una nueva instancia del router
const router = express.Router();

const {
  addComment,
  getComments,
  getUserRating,
  deleteComment,
} = require("../controllers/commentController");

const { auth, authorizeRoles } = require("../middlewares/authMiddleware");

/*
 * POST /api/comments/:eventId
 * Agrega o actualiza valoración de un usuario para un evento.
 */
router.post("/:eventId", auth, addComment);

/*
 * GET /api/comments/user/:eventId
 * Devuelve SOLO la valoración del usuario logueado para ese evento.
 */
router.get("/user/:eventId", auth, getUserRating);

/*
 * GET /api/comments/:eventId
 * Comentarios del evento (admin / organizador).
 */
router.get("/:eventId", getComments);

/*
 * DELETE /api/comments/:commentId
 * Elimina un comentario (solo admin)
 */
router.delete("/:commentId", auth, authorizeRoles("admin"), deleteComment);

module.exports = router;
