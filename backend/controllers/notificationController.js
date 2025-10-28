// controllers/notificationController.js
const Notification = require("../models/notification");
const { getDateKey } = require("../utils/dateKey");

// 📩 Listar notificaciones del usuario autenticado
exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("event", "title")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("❌ Error al listar notificaciones:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📬 Listar solo no leídas
exports.listUnread = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.id,
      read: false,
    })
      .populate("event", "title")
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error("❌ Error al listar no leídas:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Marcar como leída
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ error: "Notificación no encontrada" });
    if (notif.user.toString() !== req.user.id)
      return res.status(403).json({ error: "No autorizado" });

    notif.read = true;
    await notif.save();
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
