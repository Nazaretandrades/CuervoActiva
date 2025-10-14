//Importamos Express para poder usar el sistema de enrutamiento
const express = require("express");

//Creamos una nueva instancia de router
const router = express.Router();

//Importamos las funciones (controladores) que contienen la lógica principal
//de cada ruta relacionada con usuarios
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/userController");

//Importamos los middlewares de autenticación y autorización
const { auth, authorizeRoles } = require("../middlewares/authMiddleware");

/**
 * RUTA: POST /api/users/register
 * Permite registrar un nuevo usuario en la aplicación.
 */
router.post("/register", registerUser);

/**
 * RUTA: POST /api/users/login
 * Permite que un usuario registrado inicie sesión.
 */
router.post("/login", loginUser);

/**
 * RUTA: GET /api/users/profile
 * Devuelve la información del perfil del usuario autenticado.
 */
router.get("/profile", auth, getProfile);

/**
 * Exportamos el router
 * Esto permite importar este archivo desde "server.js"
 */
module.exports = router;
