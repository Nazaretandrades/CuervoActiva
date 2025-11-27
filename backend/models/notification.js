const mongoose = require("mongoose");

/**
 * Esquema de Notificaciones
 * Este modelo representa las notificaciones que recibe un usuario dentro del sistema,
 * ya sea por creación de eventos, valoraciones, favoritos, etc.
 */
const notificationSchema = new mongoose.Schema(
  {
    /**
     * user
     * Referencia al usuario que recibirá la notificación.
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * message
     * Texto principal de la notificación.
     */
    message: {
      type: String,
      required: true,
    },

    /**
     * read
     * Indica si el usuario ya leyó la notificación.
     * Por defecto, se marca como "false".
     */
    read: {
      type: Boolean,
      default: false,
    },

    /**
     * event
     * (Opcional) Referencia al evento asociado a la notificación.
     */
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },

    /**
     * type
     * Tipo de notificación (por ejemplo: "event_created", "rating_added", etc.).
     */
    type: {
      type: String,
    },

    /**
     * dateKey
     * Clave única por fecha que ayuda a evitar notificaciones duplicadas en el mismo día.
     */
    dateKey: {
      type: String,
    },
  },
  {
    /**
     * timestamps
     * Crea automáticamente los campos:
     * - createdAt → fecha en que se creó la notificación
     * - updatedAt → fecha en que se actualizó
     */
    timestamps: true,
  }
);

/**
 * Índice compuesto
 * Evita duplicar notificaciones iguales (mismo usuario, evento, tipo y fecha).
 * Se usa `sparse: true` para permitir algunos campos nulos sin romper la unicidad.
 */
notificationSchema.index(
  { user: 1, event: 1, type: 1, dateKey: 1 },
  { unique: true, sparse: true }
);
module.exports = mongoose.model("Notification", notificationSchema);
