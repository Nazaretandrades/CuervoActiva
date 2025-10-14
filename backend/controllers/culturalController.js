//Se importa el modelo
const CulturalSection = require('../models/culturalsection'); 

//Listar todas las secciones culturales
exports.listCulturalSections = async (req, res) => {
  try {
    const sections = await CulturalSection.find();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Detalle de una sección cultural
exports.getCulturalSection = async (req, res) => {
  try {
    const section = await CulturalSection.findById(req.params.id);
    if (!section) return res.status(404).json({ error: 'Sección no encontrada' });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
