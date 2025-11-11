const User = require("../models/user");
const Event = require("../models/event");
const Notification = require("../models/notification");
const { getDateKey } = require("../utils/dateKey");

// Agregar un evento a los favoritos del usuario
exports.addFavorite = async (req, res) => {
  try {
    // Verifico que el usuario esté autenticado antes de continuar
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Usuario no autenticado" });

    // Busco al usuario y al evento correspondiente
    const user = await User.findById(req.user.id);
    const event = await Event.findById(req.params.eventId).populate(
      "createdBy"
    );

    // Si alguno no existe, devuelvo error
    if (!user || !event)
      return res.status(404).json({ error: "Usuario o evento no encontrado" });

    // Agrego el evento a la lista de favoritos si aún no está
    if (!user.favorites.includes(req.params.eventId)) {
      user.favorites.push(req.params.eventId);
      await user.save();

      // Notifico al organizador que su evento fue añadido a favoritos
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

    // Devuelvo la lista actualizada de favoritos
    res.json(user.favorites.map((f) => f.toString()));
  } catch (err) {
    console.error("❌ Error en addFavorite:", err);
    res.status(500).json({ error: err.message });
  }
};

// Quitar un evento de los favoritos del usuario
exports.removeFavorite = async (req, res) => {
  try {
    // Verifico autenticación del usuario
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Usuario no autenticado" });

    // Busco el usuario
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Elimino el evento de la lista de favoritos (si existe)
    user.favorites = user.favorites.filter(
      (e) => e.toString() !== req.params.eventId
    );
    await user.save();

    // Devuelvo la lista de favoritos actualizada
    res.json(user.favorites.map((f) => f.toString()));
  } catch (err) {
    console.error("❌ Error en removeFavorite:", err);
    res.status(500).json({ error: err.message });
  }
};

// Listar todos los eventos favoritos del usuario
exports.listFavorites = async (req, res) => {
  try {
    // Obtengo al usuario y populamos los eventos favoritos para mostrar detalles
    const user = await User.findById(req.user.id).populate("favorites");

    // Devuelvo la lista de eventos favoritos
    res.json(user.favorites);
  } catch (err) {
    console.error("❌ Error en listFavorites:", err);
    res.status(500).json({ error: err.message });
  }
};
