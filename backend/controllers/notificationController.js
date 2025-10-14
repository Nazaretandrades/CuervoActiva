const Notification = require('../models/notification');

//Listar notificaciones del usuario
exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Marcar notificación como leída
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: 'Notificación no encontrada' });

    if (notification.user.toString() !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
