const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },          // Título del evento
  description: { type: String },                    // Descripción corta
  date: { type: Date, required: true },            // Fecha
  hour: { type: String, required: true },          // Hora
  location: { type: String, required: true },      // Lugar
  category: { type: String },                       // Música, teatro, etc.
  image_url: { type: String },                      // URL de foto o cartel
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin que creó el evento
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
