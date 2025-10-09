const cron = require("node-cron");
const { DateTime } = require("luxon"); // npm i luxon
const Notification = require("../models/notification");
const Event = require("../models/event");
const User = require("../models/user");

const TZ = "Europe/Madrid";

// Utilidad: inicio y fin del "mañana" en Madrid, convertidos a UTC para la consulta.
function getTomorrowWindowUTC() {
  const tomorrowStart = DateTime.now()
    .setZone(TZ)
    .plus({ days: 1 })
    .startOf("day");
  const tomorrowEnd = tomorrowStart.endOf("day");
  return {
    startUTC: tomorrowStart.toUTC().toJSDate(),
    endUTC: tomorrowEnd.toUTC().toJSDate(),
    dateKey: tomorrowStart.toFormat("yyyy-LL-dd"), // útil para deduplicar
  };
}

async function sendOneDayBeforeReminders() {
  try {
    const { startUTC, endUTC, dateKey } = getTomorrowWindowUTC();

    // 1) Eventos que ocurren mañana (día completo)
    const events = await Event.find({
      date: { $gte: startUTC, $lte: endUTC },
    })
      .select("_id title")
      .lean();

    if (!events.length) return;

    const eventIds = events.map((e) => e._id);

    // 2) Usuarios que tienen en favoritos alguno de esos eventos
    const users = await User.find({ favorites: { $in: eventIds } })
      .select("_id favorites")
      .lean();

    if (!users.length) return;

    // 3) Construir notificaciones en lote
    const titleById = new Map(events.map((e) => [String(e._id), e.title]));

    const bulk = [];
    for (const u of users) {
      // Para cada usuario, qué eventos de mañana tiene en favoritos
      const favsTomorrow = u.favorites.filter((evId) =>
        eventIds.some((id) => String(id) === String(evId))
      );
      for (const evId of favsTomorrow) {
        const title = titleById.get(String(evId)) || "Evento";
        bulk.push({
          user: u._id,
          message: `Recuerda: mañana es el evento "${title}"`,
          event: evId,
          type: "reminder_1day", // <--- para deduplicar por tipo
          dateKey, // <--- para deduplicar por día
          read: false,
        });
      }
    }

    if (!bulk.length) return;

    // 4) Insertar evitando duplicados (requiere índice único; ver nota abajo)
    await Notification.insertMany(bulk, { ordered: false });

    console.log(`🔔 Reminders creados: ${bulk.length} (dateKey=${dateKey})`);
  } catch (err) {
    // ordered:false hará que insertMany continúe si alguna noti choca con el índice único
    console.error(
      "❌ Error en cron de recordatorios 1 día antes:",
      err?.message || err
    );
  }
}

// Programa: todos los días a medianoche (hora Madrid)
cron.schedule("0 0 * * *", sendOneDayBeforeReminders, { timezone: TZ });

module.exports = { sendOneDayBeforeReminders };
