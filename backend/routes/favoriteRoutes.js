const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, listFavorites } = require('../controllers/favoriteController');
const { auth, authorizeRoles } = require('../middlewares/authMiddleware');

// Agregar evento a favoritos
router.post('/:eventId', auth, addFavorite);

// Quitar evento de favoritos
router.delete('/:eventId', auth, removeFavorite);

// Listar favoritos del usuario
router.get('/', auth, listFavorites);

module.exports = router;
