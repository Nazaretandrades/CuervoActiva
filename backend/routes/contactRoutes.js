const express = require("express");

// Importamos el controlador que gestiona el envío de mensajes de contacto
const { sendContactMessage } = require("../controllers/contactController");

// Creamos una nueva instancia del router
const router = express.Router();

/**
 * RUTA: POST /api/contact
 * Guarda un mensaje enviado desde el formulario de contacto.
 * - No requiere autenticación.
 * - Los datos se almacenan en la base de datos sin envío de correo.
 */
router.post("/", sendContactMessage);

module.exports = router;
