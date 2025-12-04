// Importa el modelo de Notificación
const Notification = require("../models/notification");

// Listar notificaciones
exports.listNotifications = async (req, res) => {
  try {
    // Busca todas las notificaciones cuyo campo user coincida con el ID del usuario autenticado
    const notifications = await Notification.find({ user: req.user.id })
      .populate("event", "title") // Reemplaza el ID del evento en la notificación por un objeto con campo title
      .sort({ createdAt: -1 }); // Ordena las notificaciones de más reciente a más antigua (descendente)

    // Devuelve al frontend la lista de notificaciones
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Borrar notificaciones
exports.deleteNotification = async (req, res) => {
  try {
    // Busca la notificación en la base de datos usando el ID proporcionado en la URL
    const notif = await Notification.findById(req.params.id);
    if (!notif)
      return res.status(404).json({ error: "Notificación no encontrada" });

    // Sólo puede borrar una notificación el dueño de esa notificación
    if (notif.user.toString() !== req.user.id)
      return res.status(403).json({ error: "No autorizado" });

    // La borra
    await Notification.deleteOne({ _id: notif._id });

    // Confirma al frontend que la notificación fue eliminada
    res.json({
      success: true,
      message: "Notificación eliminada permanentemente",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
