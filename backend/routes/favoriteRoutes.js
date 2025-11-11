// Importamos Express para poder crear un enrutador
const express = require("express");

// Creamos una instancia del router que gestionará todas las rutas relacionadas con los "favoritos"
const router = express.Router();

// Importamos los controladores que contienen la lógica principal
// Cada función define lo que ocurre al añadir, eliminar o listar favoritos
const {
  addFavorite,
  removeFavorite,
  listFavorites,
} = require("../controllers/favoriteController");

// Importamos los middlewares de autenticación y autorización
// Se aseguran de que el usuario esté autenticado antes de realizar cualquier acción
const { auth, authorizeRoles } = require("../middlewares/authMiddleware");

/*
 * RUTA: POST /api/favorites/:eventId
 * Permite al usuario añadir un evento a su lista de favoritos.
 * - Requiere autenticación.
 */
router.post("/:eventId", auth, addFavorite);

/**
 * RUTA: DELETE /api/favorites/:eventId
 * Permite al usuario eliminar un evento de su lista de favoritos.
 * - Requiere autenticación.
 */
router.delete("/:eventId", auth, removeFavorite);

/**
 * RUTA: GET /api/favorites
 * Devuelve todos los eventos que el usuario tiene marcados como favoritos.
 * - Requiere autenticación.
 */
router.get("/", auth, listFavorites);

/**
 * Exportamos el router
 * Esto permite que el módulo sea importado en "server.js" o en el enrutador principal.
 */
module.exports = router;
