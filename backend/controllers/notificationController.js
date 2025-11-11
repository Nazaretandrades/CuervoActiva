import Notification from "../models/notification.js";

// Listar todas las notificaciones del usuario autenticado
export const listNotifications = async (req, res) => {
  try {
    // Busco las notificaciones que pertenecen al usuario actual
    const notifications = await Notification.find({ user: req.user.id })
      .populate("event", "title") // Traigo el título del evento relacionado
      .sort({ createdAt: -1 }); // Ordeno de más reciente a más antigua

    // Devuelvo la lista completa de notificaciones
    res.json(notifications);
  } catch (err) {
    // Si algo falla, devuelvo el error con código 500
    res.status(500).json({ error: err.message });
  }
};

// Eliminar una notificación completamente
export const deleteNotification = async (req, res) => {
  try {
    // Busco la notificación por su ID
    const notif = await Notification.findById(req.params.id);

    // Si no existe, devuelvo error 404
    if (!notif)
      return res.status(404).json({ error: "Notificación no encontrada" });

    // Verifico que la notificación pertenezca al usuario autenticado
    if (notif.user.toString() !== req.user.id)
      return res.status(403).json({ error: "No autorizado" });

    // Si todo está bien, elimino la notificación definitivamente
    await Notification.deleteOne({ _id: notif._id });

    // Confirmo la eliminación con un mensaje de éxito
    res.json({
      success: true,
      message: "Notificación eliminada permanentemente",
    });
  } catch (err) {
    // Manejo de errores del servidor
    res.status(500).json({ error: err.message });
  }
};
