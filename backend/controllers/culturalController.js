// Se importa el modelo correspondiente
const CulturalSection = require("../models/culturalsection");

// 📜 Listar todas las secciones culturales
exports.listCulturalSections = async (req, res) => {
  try {
    // Obtengo todas las secciones culturales guardadas en la base de datos
    const sections = await CulturalSection.find();

    // Devuelvo la lista completa en formato JSON
    res.json(sections);
  } catch (err) {
    // Si ocurre algún error, devuelvo un mensaje con el detalle del error
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Obtener el detalle de una sección cultural específica
exports.getCulturalSection = async (req, res) => {
  try {
    // Busco la sección por su ID
    const section = await CulturalSection.findById(req.params.id);

    // Si no existe, envío un error 404
    if (!section)
      return res.status(404).json({ error: "Sección no encontrada" });

    // Si todo va bien, devuelvo la información de la sección
    res.json(section);
  } catch (err) {
    // Manejo de errores genérico del servidor
    res.status(500).json({ error: err.message });
  }
};
