// controllers/favoriteController.js
const User = require("../models/user");
const Event = require("../models/event");
const Notification = require("../models/notification");
const { getDateKey } = require("../utils/dateKey");

// ➕ Agregar evento a favoritos
exports.addFavorite = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const user = await User.findById(req.user.id);
    const event = await Event.findById(req.params.eventId).populate("createdBy");
    if (!user || !event)
      return res.status(404).json({ error: "Usuario o evento no encontrado" });

    if (!user.favorites.includes(req.params.eventId)) {
      user.favorites.push(req.params.eventId);
      await user.save();

      // 🔔 Notificar al organizador
      await Notification.findOneAndUpdate(
        {
          user: event.createdBy._id,
          event: event._id,
          type: "favorite_added",
          dateKey: getDateKey(),
        },
        {
          user: event.createdBy._id,
          event: event._id,
          type: "favorite_added",
          message: `El usuario ${user.name} añadió tu evento "${event.title}" a favoritos ❤️`,
          dateKey: getDateKey(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    res.json(user.favorites.map((f) => f.toString()));
  } catch (err) {
    console.error("❌ Error en addFavorite:", err);
    res.status(500).json({ error: err.message });
  }
};

// ➖ Quitar evento de favoritos
exports.removeFavorite = async (req, res) => {
  try {
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Usuario no autenticado" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.favorites = user.favorites.filter(
      (e) => e.toString() !== req.params.eventId
    );
    await user.save();

    res.json(user.favorites.map((f) => f.toString()));
  } catch (err) {
    console.error("❌ Error en removeFavorite:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📜 Listar favoritos
exports.listFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json(user.favorites);
  } catch (err) {
    console.error("❌ Error en listFavorites:", err);
    res.status(500).json({ error: err.message });
  }
};
