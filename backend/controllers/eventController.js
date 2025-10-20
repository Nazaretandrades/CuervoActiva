const Event = require("../models/event");
const User = require("../models/user");
const Notification = require("../models/notification");

// ✅ Listar todos los eventos (usuarios normales)
exports.listEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    console.error("❌ Error al listar eventos:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Listar solo los eventos creados por el organizador autenticado
exports.listOrganizerEvents = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const events = await Event.find({ createdBy: req.user.id });
    res.json(events);
  } catch (err) {
    console.error("❌ Error en listOrganizerEvents:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Obtener evento por ID
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });
    res.json(event);
  } catch (err) {
    console.error("❌ Error en getEvent:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Crear evento (SOLO ORGANIZADOR)
exports.createEvent = async (req, res) => {
  // Solo organizadores pueden crear
  if (req.user.role !== "organizer") {
    return res.status(403).json({ error: "Solo los organizadores pueden crear eventos" });
  }

  try {
    const event = await Event.create({ ...req.body, createdBy: req.user.id });

    // Notificar a los usuarios normales
    const users = await User.find({ role: "user" });
    const notifications = users.map((user) => ({
      user: user._id,
      message: `Nuevo evento disponible: ${event.title}`,
      event: event._id,
    }));
    await Notification.insertMany(notifications);

    console.log(`✅ Evento creado por ${req.user.id}: ${event.title}`);
    res.status(201).json(event);
  } catch (err) {
    console.error("❌ Error al crear evento:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Editar evento (organizer puede editar los suyos, admin todos)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    if (!event.createdBy) {
      return res.status(500).json({ error: "Evento sin creador asignado" });
    }

    if (req.user.role !== "admin" && !event.createdBy.equals(req.user.id)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    Object.assign(event, req.body);
    await event.save();

    console.log(`✏️ Evento actualizado: ${event.title}`);
    res.json(event);
  } catch (err) {
    console.error("❌ Error al actualizar evento:", err);
    res.status(400).json({ error: err.message });
  }
};

// ✅ Eliminar evento (solo admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    if (!event.createdBy) {
      return res.status(500).json({ error: "Evento sin creador asignado" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    await event.remove();
    console.log(`🗑️ Evento eliminado: ${event.title}`);
    res.json({ message: "Evento eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar evento:", err);
    res.status(500).json({ error: err.message });
  }
};
