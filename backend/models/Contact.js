const mongoose = require("mongoose");

/**
 * Esquema de Contacto
 * Este modelo representa los mensajes enviados desde el formulario de contacto
 * por cualquier usuario o administrador del sistema.
 */
const contactSchema = new mongoose.Schema({
  /**
   * name
   * Nombre de la persona que envía el mensaje.
   * Campo obligatorio.
   */
  name: {
    type: String,
    required: true,
  },

  /**
   * lastname
   * Apellidos del remitente del mensaje.
   * Campo opcional.
   */
  lastname: {
    type: String,
  },

  /**
   * email
   * Correo electrónico del remitente.
   * Campo obligatorio para permitir respuestas o seguimiento.
   */
  email: {
    type: String,
    required: true,
  },

  /**
   * phone
   * Número de teléfono del remitente.
   * Campo opcional.
   */
  phone: {
    type: String,
  },

  /**
   * message
   * Contenido del mensaje enviado desde el formulario.
   * Campo obligatorio.
   */
  message: {
    type: String,
    required: true,
  },

  /**
   * role
   * Indica el rol del usuario que envía el mensaje.
   * Puede ser:
   * - "admin": si lo envía un administrador
   * - "organizer": si lo envía un organizador
   * - "user": si lo envía un usuario normal o visitante
   * Por defecto se considera "user".
   */
  role: {
    type: String,
    enum: ["admin", "organizer", "user"],
    default: "user",
  },

  /**
   * date
   * Guarda la fecha y hora en la que se envió el mensaje.
   * Por defecto se asigna la fecha actual del sistema.
   */
  date: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Exportación del modelo Contact
 * Esto crea (o usa) la colección "contacts" en MongoDB.
 */
module.exports = mongoose.model("Contact", contactSchema);
