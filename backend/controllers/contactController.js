const Contact = require("../models/Contact");

// Controlador para guardar mensajes de contacto
exports.sendContactMessage = async (req, res) => {
  try {
    const { name, lastname, email, phone, message, role } = req.body;

    // Campos obligatorios
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    // Guardar en base de datos
    const contact = await Contact.create({
      name,
      lastname,
      email,
      phone,
      message,
      role: role || "user",
      date: new Date(),
    });

    console.log("📝 Mensaje guardado:", contact);

    return res.status(200).json({
      success: true,
      message: "Mensaje guardado correctamente.",
      contact,
    });
  } catch (err) {
    console.error("❌ Error al guardar contacto:", err);
    return res.status(500).json({ error: "Error al guardar el mensaje." });
  }
};
