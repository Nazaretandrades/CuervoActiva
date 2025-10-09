const Event = require('../models/event');//Se importa el modelo
const User = require('../models/user');//Se importa el modelo
const Notification = require('../models/notification');//Se importa el modelo

//Listar todos los eventos
exports.listEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Detalle de evento
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Crear evento (solo admin y organizador)
exports.createEvent = async (req, res) => {
  if (!['admin', 'organizer'].includes(req.user.role)) {
    return res.status(403).json({ error: 'No autorizado' });
  }

  try {
    const event = await Event.create({ ...req.body, createdBy: req.user.id });

    //Notificar a todos los usuarios normales
    const users = await User.find({ role: 'user' });
    const notifications = users.map(user => ({
      user: user._id,
      message: `Nuevo evento disponible: ${event.title}`,
      event: event._id
    }));
    await Notification.insertMany(notifications);

    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//Editar evento (solo admin)
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    //Validar existencia de createdBy
    if (!event.createdBy) {
      return res.status(500).json({ error: 'Evento sin creador asignado' });
    }

    //Admin puede editar cualquier evento
    //Organizer solo puede editar sus propios eventos
    if (req.user.role !== 'admin' && !event.createdBy.equals(req.user.id)) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


//Eliminar evento (solo admin)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

    //Validar existencia de createdBy
    if (!event.createdBy) {
      return res.status(500).json({ error: 'Evento sin creador asignado' });
    }

    //Solo admin puede eliminar
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    await event.remove();
    res.json({ message: 'Evento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};