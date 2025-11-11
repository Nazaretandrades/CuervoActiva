import Contact from "../models/Contact.js";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, lastname, email, phone, message, role } = req.body;

    // Verifico que los campos obligatorios estén completos antes de continuar
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    // Guardo el mensaje en la base de datos (por ahora sin enviar correo)
    const contact = await Contact.create({
      name,
      lastname,
      email,
      phone,
      message,
      role: role || "user", // Si no viene el rol, por defecto asigno "user"
      date: new Date(), // Guardo la fecha actual del envío
    });

    // Log para verificar que el mensaje se guardó correctamente
    console.log("📝 Mensaje guardado en la base de datos:", contact);

    // Respuesta al cliente confirmando que todo salió bien
    return res.status(200).json({
      success: true,
      message: "Mensaje guardado correctamente (sin envío de correo).",
      contact,
    });
  } catch (err) {
    // Si algo falla, lo registro y devuelvo un error genérico
    console.error("❌ Error al guardar contacto:", err);
    return res.status(500).json({ error: "Error al guardar el mensaje." });
  }
};
