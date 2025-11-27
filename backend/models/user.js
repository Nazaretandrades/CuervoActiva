const mongoose = require("mongoose");

/**
 * Esquema "User"
 *
 * Este modelo representa a los "usuarios"
 * Cada usuario puede tener distintos roles (usuario normal, organizador o admin).
 */
const userSchema = new mongoose.Schema({
  /**
   * name
   * Nombre visible del usuario.
   */
  name: {
    type: String,
    required: true,
  },

  /**
   * email
   * Correo electrónico del usuario.
   */
  email: {
    type: String,
    required: true,
    unique: true,
  },

  /**
   * password
   * Contraseña cifrada del usuario (no en texto plano).
   */
  password: {
    type: String,
    required: true,
  },

  /**
   * role
   * Define el tipo de usuario dentro del sistema.
   */
  role: {
    type: String,
    enum: ["user", "organizer", "admin"],
    default: "user",
  },

  /**
   * favorites
   * Lista de eventos marcados como favoritos por el usuario.
   */
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
