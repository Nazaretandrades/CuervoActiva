// Importamos Express para crear el enrutador
import express from "express";

// Importamos el controlador que gestiona el envío de mensajes de contacto
import { sendContactMessage } from "../controllers/contactController.js";

// Creamos una nueva instancia del router
// Este router manejará las rutas relacionadas con el formulario de contacto.
const router = express.Router();

/**
 * RUTA: POST /api/contact
 * Guarda un mensaje enviado desde el formulario de contacto.
 * - No requiere autenticación.
 * - Los datos se almacenan en la base de datos sin envío de correo.
 */
router.post("/", sendContactMessage);

/**
 * Exportación del router
 * Esto permite que el archivo sea importado en el enrutador principal o en server.js.
 */
export default router;
