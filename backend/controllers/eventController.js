const Event = require("../models/event");
const User = require("../models/user");
const Notification = require("../models/notification");
const { getDateKey } = require("../utils/dateKey");
const auth = require("../middlewares/authMiddleware");

// Listar todos los eventos (para usuarios normales)
exports.listEvents = async (req, res) => {
  try {
    // Busco todos los eventos guardados en la base de datos
    const events = await Event.find();

    // Devuelvo la lista de eventos
    res.json(events);
  } catch (err) {
    // En caso de error, lo registro y devuelvo una respuesta de error
    console.error("❌ Error al listar eventos:", err);
    res.status(500).json({ error: err.message });
  }
};

// Listar eventos creados por el organizador autenticado
exports.listOrganizerEvents = async (req, res) => {
  try {
    // Verifico que el usuario esté autenticado
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // Busco los eventos creados por el usuario actual (organizador)
    const events = await Event.find({ createdBy: req.user.id });

    // Devuelvo la lista de eventos del organizador
    res.json(events);
  } catch (err) {
    console.error("❌ Error en listOrganizerEvents:", err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener los datos de un evento específico por su ID
exports.getEvent = async (req, res) => {
  try {
    // Busco el evento por ID
    const event = await Event.findById(req.params.id);

    // Si no existe, devuelvo error 404
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    // Devuelvo el evento encontrado
    res.json(event);
  } catch (err) {
    console.error("❌ Error en getEvent:", err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo evento (solo organizadores)
exports.createEvent = async (req, res) => {
  try {
    // Solo los organizadores pueden crear eventos
    if (req.user.role !== "organizer")
      return res.status(403).json({ error: "No autorizado" });

    let { title, description, date, hour, location, category, image_url } =
      req.body;

    //  Normalizo el formato de fecha (acepta DD/MM/YYYY o ISO)
    if (typeof date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [dd, mm, yyyy] = date.split("/").map(Number);
      // Pongo hora fija a mediodía para evitar desfase de día por zona horaria
      date = new Date(yyyy, mm - 1, dd, 12, 0, 0);
    } else if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [y, m, d] = date.substring(0, 10).split("-").map(Number);
      date = new Date(y, m - 1, d, 12, 0, 0);
    }

    // Verifico que la fecha sea válida
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return res.status(400).json({ error: "Formato de fecha inválido" });
    }

    // Creo el evento en la base de datos
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

    // Notificación para el organizador (creación del evento)
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

    // Notifico a todos los usuarios normales sobre el nuevo evento
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

    // Respuesta final
    res.status(201).json(event);
  } catch (err) {
    console.error("❌ Error al crear evento:", err);
    res.status(500).json({ error: err.message });
  }
};

// Editar un evento existente
exports.updateEvent = async (req, res) => {
  try {
    // Busco el evento a actualizar
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    let { date } = req.body;

    // Normalizo la fecha si viene como string (DD/MM/YYYY o ISO)
    if (typeof date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [dd, mm, yyyy] = date.split("/").map(Number);
      date = new Date(yyyy, mm - 1, dd, 12, 0, 0);
      req.body.date = date;
    } else if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [y, m, d] = date.substring(0, 10).split("-").map(Number);
      date = new Date(y, m - 1, d, 12, 0, 0);
      req.body.date = date;
    }

    // Solo actualizo los campos permitidos
    Object.assign(event, req.body);
    const updated = await event.save();

    // Notificación al organizador por la edición
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

    // Si existe un admin, también lo notifico
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      await Notification.create({
        user: adminUser._id,
        message: `Has editado el evento "${event.title}".`,
        type: "event_edit",
        dateKey: new Date().toISOString(),
      });
    }

    // Devuelvo el evento actualizado
    res.json(updated);
  } catch (err) {
    console.error("❌ Error al editar evento:", err);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar un evento (solo para administradores)
exports.deleteEvent = async (req, res) => {
  try {
    // Verifico que el evento exista
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    // Solo los administradores pueden eliminar eventos
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Notificación para el admin que realiza la eliminación
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      await Notification.create({
        user: adminUser._id,
        message: `Has eliminado el evento "${event.title}".`,
        type: "event_delete",
        dateKey: new Date().toISOString(),
      });
    }

    // Elimino el evento definitivamente
    await event.deleteOne();
    console.log(`🗑️ Evento eliminado: ${event.title}`);

    // Respuesta final
    res.json({ message: "Evento eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar evento:", err);
    res.status(500).json({ error: err.message });
  }
};
