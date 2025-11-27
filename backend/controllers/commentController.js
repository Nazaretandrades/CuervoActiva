// controllers/commentController.js
const Comment = require("../models/comment");
const Event = require("../models/event");
const Notification = require("../models/notification");
const { getDateKey } = require("../utils/dateKey");

// Agregar valoración
exports.addComment = async (req, res) => {
  try {
    const { rating } = req.body;

    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const userId = req.user.id; 
    const eventId = req.params.eventId;

    // 1 Verificar si ya existe una valoración del mismo usuario para este evento
    let existing = await Comment.findOne({ user: userId, event: eventId });

    let comment;

    if (existing) {
      // 2️ Si existe -> ACTUALIZAR
      existing.rating = rating;
      comment = await existing.save();
    } else {
      // 3️ Si NO existe -> CREAR
      comment = await Comment.create({
        user: userId,
        event: eventId,
        rating,
      });
    }

    // 4 Notificar al organizador igual que antes
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

// Listar valoraciones (para ADMIN / ORGANIZADOR)
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

// Valoración del usuario logueado
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
    });

    res.json({
      userRating: ratingDoc ? ratingDoc.rating : 0,
    });
  } catch (err) {
    console.error("❌ Error en getUserRating:", err);
    res.status(500).json({ error: err.message });
  }
};
