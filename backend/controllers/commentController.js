// controllers/commentController.js
const Comment = require("../models/comment");
const Event = require("../models/event");
const Notification = require("../models/notification");
const { getDateKey } = require("../utils/dateKey");

// ➕ Agregar valoración
exports.addComment = async (req, res) => {
  try {
    const { rating } = req.body;

    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const comment = await Comment.create({
      user: req.user.id,
      event: req.params.eventId,
      rating,
    });

    // 🔔 Notificar al organizador
    const event = await Event.findById(req.params.eventId).populate("createdBy");
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
          message: `El usuario ${req.user.name || "un usuario"} ha valorado tu evento "${event.title}" con ${rating} estrellas ⭐`,
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

// 📜 Listar valoraciones
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
