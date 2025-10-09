const mongoose = require('mongoose');

const culturalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' } // Opcional, si está vinculado a un evento
}, { timestamps: true });

module.exports = mongoose.model('CulturalSection', culturalSchema);
