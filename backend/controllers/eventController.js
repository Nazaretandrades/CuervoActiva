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

    let { title, description, date, hour, location, category, image_url } =
      req.body;

    // ✅ Normalizar fecha (acepta DD/MM/YYYY o ISO)
    if (typeof date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [dd, mm, yyyy] = date.split("/").map(Number);
      // Creamos fecha local a mediodía para evitar desfase de día por zona horaria
      date = new Date(yyyy, mm - 1, dd, 12, 0, 0);
    } else if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [y, m, d] = date.substring(0, 10).split("-").map(Number);
      date = new Date(y, m - 1, d, 12, 0, 0);
    }

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return res.status(400).json({ error: "Formato de fecha inválido" });
    }

    // ✅ Crear el evento
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

    // 🔔 Notificación para el organizador (creación)
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

    // 🔔 Notificar a todos los usuarios normales sobre el nuevo evento
    const users = await User.find({ role: "user" });
    if (users.length > 0) {
      const notifs = users.map((u) => ({
        user: u._id,
        event: event._id,
        type: "new_event",
        message: `Nuevo evento disponible: ${event.title}`,
        dateKey: getDateKey(),
      }));
      await Notification.insertMany(notifs);
    }

    // ✅ Respuesta final
    res.status(201).json(event);
  } catch (err) {
    console.error("❌ Error al crear evento:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✏️ Editar evento
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    let { date } = req.body;

    // ✅ Normalizar fecha si llega como string (DD/MM/YYYY o ISO)
    if (typeof date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [dd, mm, yyyy] = date.split("/").map(Number);
      date = new Date(yyyy, mm - 1, dd, 12, 0, 0);
      req.body.date = date;
    } else if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [y, m, d] = date.substring(0, 10).split("-").map(Number);
      date = new Date(y, m - 1, d, 12, 0, 0);
      req.body.date = date;
    }

    // 🔒 Actualizamos solo los campos permitidos
    Object.assign(event, req.body);
    const updated = await event.save();

    // 🔔 Notificación de edición al organizador
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

    // 📢 Notificar al admin si existe
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
    console.error("❌ Error al editar evento:", err);
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
