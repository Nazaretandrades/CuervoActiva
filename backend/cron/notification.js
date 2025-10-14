const cron = require("node-cron");
const { DateTime } = require("luxon"); //Manejo de fechas/zonas horarias de forma segura
const Notification = require("../models/notification");
const Event = require("../models/event");
const User = require("../models/user");

//Zona horaria oficial que uso para decidir cuándo es “mañana”
const TZ = "Europe/Madrid";

/* Calcula el intervalo de tiempo que corresponde a “mañana” en la zona horaria de Madrid, y lo devuelve convertido a UTC
  para poder consultarlo correctamente en MongoDB (que guarda en UTC).
 */
function getTomorrowWindowUTC() {
  //“Mañana” según Madrid (no UTC).
  const tomorrowStart = DateTime.now()
    .setZone(TZ)
    .plus({ days: 1 })
    .startOf("day");

  //Fin del día de mañana en Madrid
  const tomorrowEnd = tomorrowStart.endOf("day");

  //Convertimos a UTC (Date) para las consultas en Mongo
  return {
    startUTC: tomorrowStart.toUTC().toJSDate(),
    endUTC: tomorrowEnd.toUTC().toJSDate(),
    dateKey: tomorrowStart.toFormat("yyyy-LL-dd"), 
  };
}

/*Busca eventos que ocurren “mañana”, localiza usuarios que los tienen en favoritos y les crea una notificación recordatorio (“mañana es el evento…”).*/
async function sendOneDayBeforeReminders() {
  try {
    //1) Calculamos la ventana [inicio, fin] de mañana (en UTC)
    const { startUTC, endUTC, dateKey } = getTomorrowWindowUTC();

    //2) Buscamos eventos cuya fecha (date) caiga mañana (día completo)
    //NOTA: se asume que Event.date está guardado en UTC.
    const events = await Event.find({
      date: { $gte: startUTC, $lte: endUTC },
    })
      .select("_id title") //solo necesitamos id y título
      .lean();

    //Si mañana no hay eventos, no hay nada que notificar
    if (!events.length) return;

    //Extraemos los IDs de esos eventos
    const eventIds = events.map((e) => e._id);

    //3) Buscamos usuarios que tengan en "favorites" cualquiera de esos eventos
    const users = await User.find({ favorites: { $in: eventIds } })
      .select("_id favorites")
      .lean();

    //Si no hay usuarios con favoritos de esos eventos, terminamos
    if (!users.length) return;

    //4) Para construir mensajes rapidamente, hacemos un diccionario id->título
    const titleById = new Map(events.map((e) => [String(e._id), e.title]));

    //5) Generamos en memoria todas las notificaciones que debemos crear
    //(una notificación por usuario y por cada evento de mañana que tenga en favoritos)
    const bulk = [];
    for (const u of users) {
      //De todos los favoritos del usuario, nos quedamos con los que son “de mañana”
      const favsTomorrow = u.favorites.filter((evId) =>
        eventIds.some((id) => String(id) === String(evId))
      );

      //Por cada evento de mañana, construimos una notificación “recordatorio”
      for (const evId of favsTomorrow) {
        const title = titleById.get(String(evId)) || "Evento";

        bulk.push({
          user: u._id, //destinatario
          message: `Recuerda: mañana es el evento "${title}"`,
          event: evId,
          type: "reminder_1day", //etiqueta para deduplicar por tipo de recordatorio
          dateKey, //etiqueta del día (YYYY-MM-DD) para evitar duplicados en ese día
          read: false, //arranca como sin leer
        });
      }
    }

    //Si no hay nada que insertar, terminamos
    if (!bulk.length) return;

    /**6) Insertamos en bloque.*/
    await Notification.insertMany(bulk, { ordered: false });

    console.log(`🔔 Reminders creados: ${bulk.length} (dateKey=${dateKey})`);
  } catch (err) {
    //Logueamos error informativo.
    console.error(
      "❌ Error en cron de recordatorios 1 día antes:",
      err?.message || err
    );
  }
}

/*Programación del cron: - “0 0 * * *” => todos los días a las 00:00. - timezone: "Europe/Madrid" para que el cron dispare exacto según Madrid*/
cron.schedule("0 0 * * *", sendOneDayBeforeReminders, { timezone: TZ });

module.exports = { sendOneDayBeforeReminders };
