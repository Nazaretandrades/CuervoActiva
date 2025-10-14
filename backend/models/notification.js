const mongoose = require("mongoose");

/**
 * Esquema "Notification"
 * Este modelo almacena las notificaciones que se envían a los usuarios.
 */
const notificationSchema = new mongoose.Schema(
  {
    /**
     * user
     * Usuario que recibe la notificación.
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * message
     * Texto descriptivo de la notificación que se muestra al usuario.
     */
    message: {
      type: String,
      required: true,
    },

    /**
     * read
     * Indica si el usuario ya ha visto o no la notificación.
     */
    read: {
      type: Boolean,
      default: false,
    },

    /**
     * event
     * Referencia al evento asociado (si aplica).
     */
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },

    /**
     * type
     * Tipo o categoría de la notificación.
     */
    type: {
      type: String,
    },

    /**
     * dateKey
     * Clave de fecha simplificada (en formato "YYYY-MM-DD").
     */
    dateKey: {
      type: String,
    },
  },
  {
    /**
     * timestamps
     * Añade automáticamente:
     *  - "createdAt": fecha de creación
     *  - "updatedAt": última vez que se modificó la notificación
     */
    timestamps: true,
  }
);

/**
 * Índice único compuesto
 *
 * Este índice garantiza que un mismo usuario "no reciba dos notificaciones
 * del mismo tipo" relacionadas con el mismo evento en la misma fecha ("dateKey").
 * Ejemplo:
 * Si el usuario 123 tiene un recordatorio "reminder_1day" para el evento 456
 * en el día "2025-10-14", no podrá generarse otro igual.
 */
notificationSchema.index(
  { user: 1, event: 1, type: 1, dateKey: 1 },
  { unique: true, sparse: true }
);

/**
 * Exportación del modelo
 * Crea (o reutiliza) la colección "notifications" en MongoDB.
 */
module.exports = mongoose.model("Notification", notificationSchema);
