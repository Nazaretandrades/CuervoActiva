const mongoose = require("mongoose");

/**
 * Esquema de comentarios
 * Este modelo representa los comentarios que los usuarios dejan en los eventos.
 */
const commentSchema = new mongoose.Schema(
  {
    /**
     * user
     * Hace referencia al usuario que escribió el comentario.
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * event
     * Hace referencia al evento sobre el cual se deja el comentario.
     */
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    /**
     * text
     * Contiene el texto o mensaje del comentario.
     */
    text: {
      type: String,
      required: true,
    },

    /**
     * rating
     * Valoración numérica del evento por parte del usuario.
     */
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
  },
  {
    /**
     * timestamps
     * Crea automáticamente dos campos:
     * - "createdAt": fecha en que se creó el comentario
     * - "updatedAt": fecha en que se actualizó por última vez
     */
    timestamps: true,
  }
);

/**
 * Exportamos el modelo "Comment" basado en el esquema anterior.
 * Esto crea la colección "comments" en MongoDB.
 */
module.exports = mongoose.model("Comment", commentSchema);
