//Importo el modelo comment 
const Comment = require('../models/comment'); 

//Agregar comentario a un evento
exports.addComment = async (req, res) => {
  try {
    const { text, rating } = req.body;
    const comment = await Comment.create({
      user: req.user.id,
      event: req.params.eventId,
      text,
      rating
    });
    res.json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

//Listar comentarios de un evento
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ event: req.params.eventId }).populate('user', 'name');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
