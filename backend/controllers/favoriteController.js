const User = require("../models/user");
const Event = require("../models/event");

// Agregar evento a favoritos
exports.addFavorite = async (req, res) => {
  try {
    console.log("🟢 addFavorite => req.user:", req.user);
    console.log("🟢 addFavorite => eventId:", req.params.eventId);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Usuario no autenticado o token inválido" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    if (!user.favorites.includes(req.params.eventId)) {
      user.favorites.push(req.params.eventId);
      await user.save();
    }

    // 🔹 Convertir los ObjectId a strings antes de enviar
    res.json(user.favorites.map(f => f.toString()));
  } catch (err) {
    console.error("❌ Error en addFavorite:", err);
    res.status(500).json({ error: err.message });
  }
};

// Quitar evento de favoritos
exports.removeFavorite = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Usuario no autenticado o token inválido" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    user.favorites = user.favorites.filter(e => e.toString() !== req.params.eventId);
    await user.save();

    // 🔹 Convertir también a strings
    res.json(user.favorites.map(f => f.toString()));
  } catch (err) {
    console.error("❌ Error en removeFavorite:", err);
    res.status(500).json({ error: err.message });
  }
};

// Listar favoritos del usuario
exports.listFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json(user.favorites);
  } catch (err) {
    console.error("❌ Error en listFavorites:", err);
    res.status(500).json({ error: err.message });
  }
};
