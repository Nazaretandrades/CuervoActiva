// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// 📍 Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🌿 Cargar .env
dotenv.config();

// 🚀 Inicializar app
const app = express();

// 🧩 Middlewares base
app.use(cors());
app.use(express.json());

// 🧠 Conectar a la base de datos
connectDB();

// 📁 Verificar carpeta uploads
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Carpeta 'uploads' creada automáticamente en", uploadsPath);
}

// 🖼️ Servir carpeta 'uploads' como pública (accesible desde web y móvil)
app.use("/uploads", express.static(uploadsPath));

// ✅ Registrar rutas
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import culturalRoutes from "./routes/culturalRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

// 🧭 Asociar rutas
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cultural", culturalRoutes);
app.use("/api/contact", contactRoutes);

// 🚫 Ruta 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada", path: req.originalUrl });
});

// 🌍 Iniciar servidor
const PORT = process.env.PORT || 5000;
const LOCAL_IP = process.env.LOCAL_IP || "192.168.18.19"; // ✅ Ajusta esta IP según tu red local

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor corriendo correctamente:");
  console.log(`💻 Web: http://localhost:${PORT}`);
  console.log(`📱 Android (red local): http://${LOCAL_IP}:${PORT}`);
});
