//Importamos Express para poder usar su sistema de enrutamiento.
const express = require("express");

//Creamos una instancia del router de Express.
//Este router contendrá todas las rutas relacionadas con las secciones culturales.
const router = express.Router();

//Importamos las funciones del controlador que gestionan la lógica
const {
  listCulturalSections,
  getCulturalSection,
} = require("../controllers/culturalController");

/**
 * RUTA: GET /api/cultural/
 * Devuelve todas las secciones culturales disponibles en la base de datos.
 */
router.get("/", listCulturalSections);

/**
 * RUTA: GET /api/cultural/:id
 * Devuelve el detalle de una sección cultural específica.
 */
router.get("/:id", getCulturalSection);

/**
 * Exportación del router
 * Esto permite que este archivo sea importado en "server.js"
 */
module.exports = router;
