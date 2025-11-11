const Comment = require("../models/comment");
const Event = require("../models/event");
const Notification = require("../models/notification");
const { getDateKey } = require("../utils/dateKey");

// Agregar valoración
exports.addComment = async (req, res) => {
  try {
    const { rating } = req.body;

    // Verifico que el usuario esté autenticado antes de permitir comentar
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Usuario no autenticado" });

    // Creo el comentario con la valoración y lo asocio al evento y al usuario
    const comment = await Comment.create({
      user: req.user.id,
      event: req.params.eventId,
      rating,
    });

    // Busco el evento para poder notificar al organizador
    const event = await Event.findById(req.params.eventId).populate(
      "createdBy"
    );

    // Si el evento existe y tiene un creador, le envío una notificación
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
        // Uso upsert para crear la notificación si no existe (o actualizarla si ya está)
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // Devuelvo el comentario creado
    res.json(comment);
  } catch (err) {
    // Si algo falla, lo muestro en consola y devuelvo el error al cliente
    console.error("❌ Error en addComment:", err);
    res.status(400).json({ error: err.message });
  }
};

// Listar valoraciones
exports.getComments = async (req, res) => {
  try {
    // Obtengo todos los comentarios del evento y muestro solo el nombre del usuario
    const comments = await Comment.find({ event: req.params.eventId }).populate(
      "user",
      "name"
    );

    // Devuelvo la lista completa de valoraciones
    res.json(comments);
  } catch (err) {
    // Manejo de error general
    res.status(500).json({ error: err.message });
  }
};
