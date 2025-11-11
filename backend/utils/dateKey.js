/**
 * Utilidad: getDateKey
 * Devuelve una cadena con la fecha actual en formato "YYYY-MM-DD".
 *
 * Esta función se utiliza para generar una "clave de fecha" única
 * (por ejemplo, para agrupar o evitar duplicar notificaciones
 * en el mismo día).
 */
exports.getDateKey = () => {
  const now = new Date(); // Obtenemos la fecha y hora actual
  return now.toISOString().split("T")[0]; // Extraemos solo la parte de la fecha (YYYY-MM-DD)
};
