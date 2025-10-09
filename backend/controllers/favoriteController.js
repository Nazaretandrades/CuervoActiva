const User = require('../models/user');//Se importa el modelo
const Notification = require('../models/notification');//Se importa el modelo
const Event = require('../models/event');//Se importa el modelo

//Agregar evento a favoritos
exports.addFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.favorites.includes(req.params.eventId)) {
      user.favorites.push(req.params.eventId);
      await user.save();

      //Crear notificación al usuario
      const event = await Event.findById(req.params.eventId);
      await Notification.create({
        user: user._id,
        message: `Has marcado "${event.title}" como favorito. Te avisaremos antes de que empiece.`,
        event: event._id
      });
    }
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


//Quitar evento de favoritos
exports.removeFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter(e => e.toString() !== req.params.eventId);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Listar favoritos del usuario
exports.listFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
