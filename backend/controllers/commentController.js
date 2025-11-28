// controllers/commentController.js
const Comment = require("../models/comment");
const Event = require("../models/event");
const Notification = require("../models/notification");
const { getDateKey } = require("../utils/dateKey");

// ⭐ Agregar o actualizar valoración + comentario
exports.addComment = async (req, res) => {
  try {
    const { rating, text } = req.body;

    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const userId = req.user.id;
    const eventId = req.params.eventId;

    // 🔍 Buscar si ya existe comentario/valoración del usuario
    let existing = await Comment.findOne({ user: userId, event: eventId });

    let comment;

    if (existing) {
      // ⭐ Siempre actualizar la valoración si llega
      if (rating) existing.rating = rating;

      // 📝 SOLO actualizar el texto si llega
      if (typeof text === "string" && text.trim() !== "") {
        existing.text = text.trim();
      }

      comment = await existing.save();
    } else {
      // Crear nuevo comentario
      comment = await Comment.create({
        user: userId,
        event: eventId,
        rating,
        text: typeof text === "string" ? text.trim() : "",
      });
    }

    // 📩 Notificar al organizador cuando alguien valora su evento
    const event = await Event.findById(eventId).populate("createdBy");

    if (event && event.createdBy) {
      await Notification.findOneAndUpdate(
        {
          user: event.createdBy._id,
          event: event._id,
          type: "rating_added",
          dateKey: getDateKey(),
        },
        {
          user: event.createdBy._id,
          event: event._id,
          type: "rating_added",
          message: `El usuario ${
            req.user.name || "un usuario"
          } ha valorado tu evento "${event.title}" con ${rating} estrellas ⭐`,
          dateKey: getDateKey(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.json(comment);
  } catch (err) {
    console.error("❌ Error en addComment:", err);
    res.status(400).json({ error: err.message });
  }
};

// 🗑️ Eliminar comentario (solo admin)
exports.deleteComment = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "No autorizado" });

    const commentId = req.params.commentId;

    // Buscar comentario antes de borrar
    const comment = await Comment.findById(commentId).populate("user event");

    if (!comment)
      return res.status(404).json({ error: "Comentario no encontrado" });

    const userId = comment.user._id;
    const eventTitle = comment.event?.title || "un evento";

    // Eliminar comentario
    await Comment.findByIdAndDelete(commentId);

    // Crear notificación para el usuario afectado
    await Notification.create({
      user: userId,
      event: comment.event ? comment.event._id : null,
      type: "comment_deleted",
      message: `Tu comentario en el evento "${eventTitle}" ha sido eliminado por el administrador.`,
      dateKey: getDateKey(),
    });

    res.json({ message: "Comentario eliminado y usuario notificado" });
  } catch (err) {
    console.error("❌ Error en deleteComment:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🧾 Listar comentarios de un evento
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ event: req.params.eventId }).populate(
      "user",
      "name"
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ⭐ Obtener la valoración del usuario para un evento
exports.getUserRating = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const userId = req.user.id;
    const eventId = req.params.eventId;

    const ratingDoc = await Comment.findOne({ user: userId, event: eventId });

    console.log("⭐ getUserRating →", {
      userId,
      eventId,
      rating: ratingDoc ? ratingDoc.rating : null,
      text: ratingDoc ? ratingDoc.text : null,
    });

    res.json({
      userRating: ratingDoc ? ratingDoc.rating : 0,
      userComment: ratingDoc ? ratingDoc.text : "",
    });
  } catch (err) {
    console.error("❌ Error en getUserRating:", err);
    res.status(500).json({ error: err.message });
  }
};
