//Importamos Express para poder crear un enrutador
const express = require("express");

//Creamos una instancia del router que gestionará las rutas relacionadas con los "favoritos"
const router = express.Router();

//Importamos los controladores que contienen la lógica
//Cada función (addFavorite, removeFavorite, listFavorites) define lo que pasa en cada endpoint
const {
  addFavorite,
  removeFavorite,
  listFavorites,
} = require("../controllers/favoriteController");

//Importamos los middlewares que verifican si el usuario está autenticado y su rol
const { auth, authorizeRoles } = require("../middlewares/authMiddleware");

/**
 * RUTA: POST /api/favorites/:eventId
 * Permite al usuario añadir un evento a su lista de favoritos.
 */
router.post("/:eventId", auth, addFavorite);

/**
 * RUTA: DELETE /api/favorites/:eventId
 * Permite al usuario quitar un evento de su lista de favoritos.
 */
router.delete("/:eventId", auth, removeFavorite);

/**
 * RUTA: GET /api/favorites
 * Devuelve la lista de eventos que el usuario tiene marcados como favoritos.
 */
router.get("/", auth, listFavorites);

/**
 * Exportamos el router
 * Esto permite que este archivo sea importado desde "server.js"
 */
module.exports = router;
