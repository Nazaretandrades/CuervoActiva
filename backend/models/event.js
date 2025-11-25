const mongoose = require("mongoose");

/**
 * Esquema "Event"
 * Representa un evento
 */
const eventSchema = new mongoose.Schema(
  {
    /**
     * title
     * Nombre o título principal del evento.
     */
    title: {
      type: String,
      required: true,
    },

    /**
     * description
     * Descripción breve o informativa del evento.
     */
    description: {
      type: String,
    },

    /**
     * date
     * Fecha en la que se celebrará el evento.
     */
    date: {
      type: Date,
      required: true,
    },

    /**
     * hour
     * Hora del evento.
     */
    hour: {
      type: String,
      required: true,
    },

    /**
     * location
     * Lugar o dirección donde se realiza el evento.
     */
    location: {
      type: String,
      required: true,
    },

    /**
     * category
     * Tipo de evento o categoría temática.
     */
    category: {
      type: String,
    },

    /**
     * image_url
     * Enlace o URL de la imagen/cartel del evento.
     */
    image_url: {
      type: String,
    },

    /**
     * Hace referencia al usuario (normalmente un organizador)
     * que creó o publicó el evento.
     */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    /**
     * timestamps
     * Añade automáticamente los campos:
     * - "createdAt": fecha y hora en que se creó el evento.
     * - "updatedAt": fecha y hora de la última modificación.
     */
    timestamps: true,
  }
);
module.exports = mongoose.model("Event", eventSchema);
