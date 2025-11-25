const mongoose = require("mongoose");

/**
 * Esquema "CulturalSection"
 *
 * Este modelo representa una "sección cultural"
 * dentro de tu aplicación (por ejemplo: historia del pueblo, costumbres,
 * gastronomía, fiestas, etc.).
 */
const culturalSchema = new mongoose.Schema(
  {
    /**
     * title
     * Título de la sección o artículo cultural.
     */
    title: {
      type: String,
      required: true,
    },

    /**
     * content
     * Texto o descripción completa de la sección cultural.
     */
    content: {
      type: String,
      required: true,
    },

    /**
     * event (opcional)
     * Referencia a un evento relacionado con esta sección cultural.
     */
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  },
  {
    /**
     * timestamps
     * Añade automáticamente los campos:
     * - "createdAt": fecha de creación de la sección cultural
     * - "updatedAt": última fecha de modificación
     */
    timestamps: true,
  }
);

module.exports = mongoose.model("CulturalSection", culturalSchema);
