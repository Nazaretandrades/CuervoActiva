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

const Event = require("../models/event");
const User = require("../models/user");
const Notification = require("../models/notification");

// ✅ Crear evento (SOLO ORGANIZADOR)
exports.createEvent = async (req, res) => {
  try {
    // Solo organizadores pueden crear
    if (req.user.role !== "organizer") {
      return res
        .status(403)
        .json({ error: "Solo los organizadores pueden crear eventos" });
    }

    const { title, description, date, hour, location, category, image_url } =
      req.body;

    // ✅ Validar campos obligatorios (incluye imagen)
    if (
      !title?.trim() ||
      !description?.trim() ||
      !date?.trim() ||
      !hour?.trim() ||
      !location?.trim() ||
      !category?.trim() ||
      !image_url?.trim()
    ) {
      return res.status(400).json({
        error:
          "Todos los campos (título, descripción, fecha, hora, lugar, categoría e imagen) son obligatorios.",
      });
    }

    // ✅ Crear evento
    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date: date.trim(),
      hour: hour.trim(),
      location: location.trim(),
      category: category.trim(),
      image_url: image_url.trim(),
      createdBy: req.user.id,
    });

    // 🔔 Notificar a los usuarios normales
    const users = await User.find({ role: "user" });
    if (users.length > 0) {
      const notifications = users.map((user) => ({
        user: user._id,
        message: `Nuevo evento disponible: ${event.title}`,
        event: event._id,
      }));
      await Notification.insertMany(notifications);
    }

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

    // 🔸 Solo el creador o un admin puede editar
    if (
      req.user.role !== "admin" &&
      event.createdBy?.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "No autorizado" });
    }

    Object.assign(event, req.body);
    const updated = await event.save();

    console.log(`✏️ Evento actualizado: ${updated.title}`);
    res.json(updated);
  } catch (err) {
    console.error("❌ Error al actualizar evento:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Eliminar evento (solo admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    // 🔸 Solo admin puede eliminar
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    await event.deleteOne();
    console.log(`🗑️ Evento eliminado: ${event.title}`);
    res.json({ message: "Evento eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar evento:", err);
    res.status(500).json({ error: err.message });
  }
};
