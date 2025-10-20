
// PUNTO DE ENTRADA DEL BACKEND

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();
const path = require("path");
const fs = require("fs");

// Inicializamos la app
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
connectDB();

// 📁 Verificar que exista la carpeta uploads/
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Carpeta 'uploads' creada automáticamente en", uploadsPath);
}

// Middleware para servir archivos subidos
app.use("/uploads", express.static(uploadsPath));

// Rutas principales
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/cultural", require("./routes/culturalRoutes"));

// Puerto y arranque
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor corriendo en:`);
  console.log(`🌐 Web: http://localhost:${PORT}`);
  console.log(`📱 Android (red local): http://192.168.18.19:${PORT}`);
});