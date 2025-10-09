const express = require('express');
const router = express.Router();
const { listNotifications, markAsRead } = require('../controllers/notificationController');
const { auth, authorizeRoles } = require('../middlewares/authMiddleware');

// Listar notificaciones del usuario
router.get('/', auth, listNotifications);

// Marcar notificación como leída
router.put('/:id/read', auth, markAsRead);

module.exports = router;
