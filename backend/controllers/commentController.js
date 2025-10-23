//Importo el modelo comment 
const Comment = require('../models/comment'); 

//Agregar RATING a un evento
exports.addComment = async (req, res) => {
  try {
    const { rating } = req.body;

    console.log("🟢 Nuevo intento de valoración:");
    console.log("Usuario autenticado:", req.user);
    console.log("Evento ID:", req.params.eventId);
    console.log("Valoración:", rating);

    if (!req.user || !req.user.id) {
      console.log("❌ Usuario no autenticado, no se puede guardar valoración.");
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    const comment = await Comment.create({
      user: req.user.id,
      event: req.params.eventId,
      rating
    });

    console.log("✅ Valoración guardada:", comment);
    res.json(comment);
  } catch (err) {
    console.error("❌ Error al guardar comentario:", err);
    res.status(400).json({ error: err.message });
  }
};


//Listar RATING de un evento
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ event: req.params.eventId }).populate('user', 'name');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
