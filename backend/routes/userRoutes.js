const express = require("express");
const router = express.Router();

// Importamos las funciones del controlador que manejan la lógica de los usuarios
const {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers,
  deleteUser,
  updateProfile,
} = require("../controllers/userController");

// Importamos los middlewares de autenticación y control de roles
const { auth, authorizeRoles } = require("../middlewares/authMiddleware");

/**
 * RUTA: POST /api/users/register
 * Registra un nuevo usuario en el sistema.
 * - Ruta pública (no requiere autenticación).
 */
router.post("/register", registerUser);

/**
 * RUTA: POST /api/users/login
 * Inicia sesión con correo o nombre de usuario y contraseña.
 * - Ruta pública.
 */
router.post("/login", loginUser);

/**
 * RUTA: GET /api/users/profile
 * Devuelve la información del perfil del usuario autenticado.
 * - Requiere autenticación.
 */
router.get("/profile", auth, getProfile);


/**
 * RUTA: GET /api/users
 * Devuelve la lista de todos los usuarios (excepto los administradores).
 * - Solo accesible para administradores.
 */
router.get("/", auth, authorizeRoles("admin"), getAllUsers);

/**
 * RUTA: DELETE /api/users/:id
 * Permite a un administrador eliminar un usuario del sistema.
 * - Solo accesible para administradores.
 */
router.delete("/:id", auth, authorizeRoles("admin"), deleteUser);

/**
 * Exportamos el router
 * Esto permite que este archivo sea importado en "server.js" o en el enrutador principal.
 */
module.exports = router;
