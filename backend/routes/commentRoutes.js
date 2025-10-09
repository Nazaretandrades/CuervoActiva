const express = require('express');
const router = express.Router();
const { addComment, getComments } = require('../controllers/commentController');
const { auth, authorizeRoles } = require('../middlewares/authMiddleware');

// Agregar comentario a un evento
router.post('/:eventId', auth, addComment);

// Listar comentarios de un evento
router.get('/:eventId', getComments);

module.exports = router;
