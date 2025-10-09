const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controllers/userController');
const { auth, authorizeRoles } = require('../middlewares/authMiddleware');

// Registro
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Perfil (solo usuario autenticado)
router.get('/profile', auth, getProfile);

module.exports = router;
