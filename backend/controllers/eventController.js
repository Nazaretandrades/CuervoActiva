// Importaciones de los modelos necesarios
const Event = require("../models/event");
const User = require("../models/user");
const Notification = require("../models/notification");
// Función que devuelve una clave de fecha
const { getDateKey } = require("../utils/dateKey");

// Listar todos los eventos (para usuarios normales y administrador)
exports.listEvents = async (req, res) => {
  try {
    // Crea un objeto fecha con la fecha actual
    const today = new Date();
    // Se configuran las horas a 00:00:00 para que el filtro funcione correctamente
    today.setHours(0, 0, 0, 0);

    //Busca todos los eventos cuya fecha sea igual o mayor a hoy
    const events = await Event.find({
      date: { $gte: today },
    });

    // Responde con la lista de eventos
    res.json(events);
  } catch (err) {
    console.error("❌ Error al listar eventos:", err);
    res.status(500).json({ error: err.message });
  }
};

// Listar eventos creados por el organizador autenticado
exports.listOrganizerEvents = async (req, res) => {
  try {
    // Verifica el usuario (Solo funciona si el usuario está logueado)
    if (!req.user || !req.user.id)
      return res.status(401).json({ error: "Usuario no autenticado" });

    // Crea un objeto fecha con la fecha actual
    const today = new Date();
    // Se configuran las horas a 00:00:00 para que el filtro funcione correctamente
    today.setHours(0, 0, 0, 0);

    // Buscar solo eventos creados por el organizador y por date >= today
    const events = await Event.find({
      createdBy: req.user.id,
      date: { $gte: today },
    });

    // Responde con la lista de eventos
    res.json(events);
  } catch (err) {
    console.error("❌ Error en listOrganizerEvents:", err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un evento específico
exports.getEvent = async (req, res) => {
  try {
    // Busca un evento por su ID
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    // Responde con la lista de eventos
    res.json(event);
  } catch (err) {
    console.error("❌ Error en getEvent:", err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un evento
exports.createEvent = async (req, res) => {
  try {
    // Se verifica el rol (Solo organizadores y administradores pueden crear eventos)
    if (!["organizer", "admin"].includes(req.user.role))
      return res.status(403).json({ error: "No autorizado" });

    // Cogen los campos de la url
    let { title, description, date, hour, location, category, image_url } =
      req.body;

      // Verifica si no está vacío cada campo
    if (!title)
      return res.status(400).json({ error: "El título es obligatorio" });
    if (!description)
      return res.status(400).json({ error: "La descripción es obligatoria" });
    if (!date)
      return res.status(400).json({ error: "La fecha es obligatoria" });
    if (!hour) return res.status(400).json({ error: "La hora es obligatoria" });
    if (!location)
      return res.status(400).json({ error: "La ubicación es obligatoria" });
    if (!category)
      return res.status(400).json({ error: "La categoría es obligatoria" });
    if (!image_url)
      return res.status(400).json({ error: "La imagen es obligatoria" });

    // Aquí se formatea la fecha
    /**
     * En ambos casos (if y else if) se comprueba primero que date sea un string
     * Regex de la fecha dd/mm/aaaa
     * const [dd, mm, yyyy] -> Convierte cada string en número
     * Se crea un objeto Date real de JavaScript
     */
    if (typeof date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [dd, mm, yyyy] = date.split("/").map(Number);
      date = new Date(yyyy, mm - 1, dd, 12, 0, 0);
    } else if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [y, m, d] = date.substring(0, 10).split("-").map(Number);
      date = new Date(y, m - 1, d, 12, 0, 0);
    }

    // Y se valida la fecha final
    if (!(date instanceof Date) || isNaN(date.getTime()))
      return res.status(400).json({ error: "Formato de fecha inválido" });

    // Se guarda el evento con el usuario creador asignado a createdBy
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

    // Notificación para el organizador
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

    // Notificar a usuarios normales
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

    // Devuelve la respuesta
    res.status(201).json(event);
  } catch (err) {
    console.error("❌ Error al crear evento:", err);
    res.status(500).json({ error: err.message });
  }
};

// Editar un evento 
exports.updateEvent = async (req, res) => {
  try {
    // Busca evento por id 
    const event = await Event.findById(req.params.id);
    // Comprueba si existe
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    // Coge la fecha de la url
    let { date } = req.body;


    // Aquí se formatea la fecha
    /**
     * En ambos casos (if y else if) se comprueba primero que date sea un string
     * Regex de la fecha dd/mm/aaaa
     * const [dd, mm, yyyy] -> Convierte cada string en número
     * Se crea un objeto Date real de JavaScript
     */
    if (typeof date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      const [dd, mm, yyyy] = date.split("/").map(Number);
      date = new Date(yyyy, mm - 1, dd, 12, 0, 0);
      req.body.date = date;
    } else if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      const [y, m, d] = date.substring(0, 10).split("-").map(Number);
      date = new Date(y, m - 1, d, 12, 0, 0);
      req.body.date = date;
    }

    // Se aplica los cambios
    Object.assign(event, req.body);
    // Se guarda el evento, es decir, se actualiza
    const updated = await event.save();

    // Se crea la notificación para el organizador
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

    // Buscamos a los administradores
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      // Si hay admistrador, se creará una notificación
      await Notification.create({
        user: adminUser._id,
        message: `Has editado el evento "${event.title}".`,
        type: "event_edit",
        dateKey: new Date().toISOString(),
      });
    }

    // Enviar respuesta
    res.json(updated);
  } catch (err) {
    console.error("❌ Error al editar evento:", err);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar evento
exports.deleteEvent = async (req, res) => {
  try {
    // Busca un evento por su ID
    const event = await Event.findById(req.params.id);
    // Comprueba que se encuentra ese evento
    if (!event) return res.status(404).json({ error: "Evento no encontrado" });

    // Verificar que el usuario sea admin, para poder eliminar el evento
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "No autorizado" });

    // Se crea la notificación al administrador
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      await Notification.create({
        user: adminUser._id,
        message: `Has eliminado el evento "${event.title}".`,
        type: "event_delete",
        dateKey: new Date().toISOString(),
      });
    }

    // Se borra el evento
    await event.deleteOne();

    // Se envía la respuesta
    res.json({ message: "Evento eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar evento:", err);
    res.status(500).json({ error: err.message });
  }
};
