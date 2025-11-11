// backend/models/Contact.js
import mongoose from "mongoose";

/**
 * Esquema de Contacto
 * Este modelo almacena los mensajes enviados a través del formulario de contacto.
 * Incluye información básica del remitente y el rol asociado.
 */
const contactSchema = new mongoose.Schema({
  /**
   * name
   * Nombre del usuario que envía el mensaje.
   */
  name: { type: String, required: true },

  /**
   * lastname
   * Apellido del usuario (opcional).
   */
  lastname: { type: String },

  /**
   * email
   * Correo electrónico del remitente. Es obligatorio.
   */
  email: { type: String, required: true },

  /**
   * phone
   * Número de teléfono del remitente (opcional).
   */
  phone: { type: String },

  /**
   * message
   * Contenido del mensaje enviado por el usuario.
   */
  message: { type: String, required: true },

  /**
   * role
   * Rol del usuario que envía el mensaje.
   * Puede ser "admin", "organizer" o "user".
   * Por defecto se asigna "user".
   */
  role: { type: String, enum: ["admin", "organizer", "user"], default: "user" },

  /**
   * date
   * Fecha en que se envió el mensaje. Se asigna automáticamente.
   */
  date: { type: Date, default: Date.now },
});

/**
 * Exporto el modelo "Contact" basado en el esquema anterior.
 * MongoDB creará la colección "contacts" automáticamente.
 */
export default mongoose.model("Contact", contactSchema);
