// models/notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
  event:   { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  type:    { type: String },        
  dateKey: { type: String }         
}, { timestamps: true });

//un mismo usuario no recibirá dos notificaciones del mismo tipo
notificationSchema.index(
  { user: 1, event: 1, type: 1, dateKey: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
