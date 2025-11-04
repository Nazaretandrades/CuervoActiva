// backend/models/Contact.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  role: { type: String, enum: ["admin", "organizer", "user"], default: "user" },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Contact", contactSchema);
