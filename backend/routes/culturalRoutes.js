const express = require('express');
const router = express.Router();
const { listCulturalSections, getCulturalSection } = require('../controllers/culturalController');

// Listar todas las secciones culturales
router.get('/', listCulturalSections);

// Detalle de una sección cultural
router.get('/:id', getCulturalSection);

module.exports = router;
