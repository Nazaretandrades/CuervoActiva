const Notification = require("../models/notification");

// Listar notificaciones
exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("event", "title")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Borrar notificaciones (SOLO ADMIN)
exports.deleteNotification = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);

    if (!notif)
      return res.status(404).json({ error: "Notificación no encontrada" });

    if (notif.user.toString() !== req.user.id)
      return res.status(403).json({ error: "No autorizado" });

    await Notification.deleteOne({ _id: notif._id });

    res.json({
      success: true,
      message: "Notificación eliminada permanentemente",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
