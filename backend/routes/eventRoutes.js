const express = require('express');
const router = express.Router();
const {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

const { auth, authorizeRoles } = require('../middlewares/authMiddleware');

// Listado de eventos (todos)
router.get('/', listEvents);

// Detalle de evento (todos)
router.get('/:id', getEvent);

// Crear evento (solo admin y organizer)
router.post('/', auth, authorizeRoles('admin', 'organizer'), createEvent);

// Editar evento (solo admin y organizer)
router.put('/:id', auth, authorizeRoles('admin', 'organizer'), updateEvent);

// Eliminar evento (solo admin)
router.delete('/:id', auth, authorizeRoles('admin'), deleteEvent);

module.exports = router;
