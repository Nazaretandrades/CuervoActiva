// ✅ SOLO una vez
const Event = require("../models/event");
const User = require("../models/user");
const Notification = require("../models/notification");
const { getDateKey } = require("../utils/dateKey");
const auth = require("../middlewares/authMiddleware");

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

// ✅ Listar eventos de organizador
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

// ➕ Crear evento
exports.createEvent = async (req, res) => {
  try {
    if (req.user.role !== "organizer")
      return res.status(403).json({ error: "No autorizado" });

    const { title, description, date, hour, location, category, image_url } =
      req.body;

    const event = await Event.create({
      title,
      description,
      date,
      hour,
      location,
      category,
      image_url,
      createdBy: req.user.id,
    });

    // 🔔 Notificación para organizador (creación)
    await Notification.findOneAndUpdate(
      {
        user: req.user.id,
        event: event._id,
        type: "event_created",
        dateKey: getDateKey(),
      },
      {
        user: req.user.id,
        event: event._id,
        type: "event_created",
        message: `Has creado correctamente el evento "${event.title}" ✅`,
        dateKey: getDateKey(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 🔔 Notificar a usuarios normales del nuevo evento
    const users = await User.find({ role: "user" });
    const notifs = users.map((u) => ({
      user: u._id,
      event: event._id,
      type: "new_event",
      message: `Nuevo evento disponible: ${event.title}`,
      dateKey: getDateKey(),
    }));
    await Notification.insertMany(notifs);

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Editar evento
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    Object.assign(event, req.body);
    const updated = await event.save();

    // 🔔 Notificar edición
    await Notification.findOneAndUpdate(
      {
        user: req.user.id,
        event: updated._id,
        type: "event_edited",
        dateKey: getDateKey(),
      },
      {
        user: req.user.id,
        event: updated._id,
        type: "event_edited",
        message: `Has editado el evento "${updated.title}" ✏️`,
        dateKey: getDateKey(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 📢 Crear notificación para el admin (si quien edita es admin)
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      await Notification.create({
        user: adminUser._id,
        message: `Has editado el evento "${event.title}".`,
        type: "event_edit",
        dateKey: new Date().toISOString(),
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Eliminar evento (solo admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    // 📢 Crear notificación para el admin
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      await Notification.create({
        user: adminUser._id,
        message: `Has eliminado el evento "${event.title}".`,
        type: "event_delete",
        dateKey: new Date().toISOString(),
      });
    }

    await event.deleteOne();
    console.log(`🗑️ Evento eliminado: ${event.title}`);
    res.json({ message: "Evento eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar evento:", err);
    res.status(500).json({ error: err.message });
  }
};
