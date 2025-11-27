const express = require("express");

// Creamos una instancia del router de Express.
// Este router agrupa todas las rutas relacionadas con las secciones culturales.
const router = express.Router();

// Importamos las funciones del controlador que contienen la lógica principal
const {
  listCulturalSections,
  getCulturalSection,
} = require("../controllers/culturalController");

/**
 * RUTA: GET /api/cultural/
 * Devuelve todas las secciones culturales disponibles en la base de datos.
 * - Ruta pública, no requiere autenticación.
 */
router.get("/", listCulturalSections);

/**
 * RUTA: GET /api/cultural/:id
 * Devuelve el detalle de una sección cultural específica según su ID.
 * - Ruta pública, no requiere autenticación.
 */
router.get("/:id", getCulturalSection);
module.exports = router;
