const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const fs = require("fs");

// Cargamos las variables de entorno desde .env
dotenv.config();

// Inicializamos la aplicación Express
const app = express();

// Importante para que detecte bien https detrás de Render
app.set("trust proxy", 1);

// Middlewares base
app.use(cors());
app.use(express.json());

// Conectamos con MongoDB
connectDB();

// Crear el administrador
const createAdminOnStart = require("./config/createAdminOnStart");

// Esperar a que MongoDB se conecte antes de crear el admin
setTimeout(() => {
  createAdminOnStart();
}, 500);

// Ruta absoluta a "uploads"
const uploadsPath = process.env.UPLOAD_PATH 
  ? process.env.UPLOAD_PATH
  : path.join(__dirname, "uploads");

// Crear carpeta si no existe
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Carpeta 'uploads' creada automáticamente en", uploadsPath);
}

// Servir imágenes públicamente
app.use("/uploads", express.static(uploadsPath));;

// Importamos las rutas (CommonJS)
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const commentRoutes = require("./routes/commentRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const culturalRoutes = require("./routes/culturalRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Asociamos las rutas a sus endpoints
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cultural", culturalRoutes);
app.use("/api/contact", contactRoutes);

// Middleware 404
app.use((req, res) => {
  res
    .status(404)
    .json({ error: "Ruta no encontrada", path: req.originalUrl });
});

// Configuración del servidor
const PORT = process.env.PORT || 5000;
const LOCAL_IP = process.env.LOCAL_IP || "192.168.18.19";

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor corriendo correctamente:");
  console.log(`💻 Web: http://localhost:${PORT}`);
  console.log(`📱 Android (red local): http://${LOCAL_IP}:${PORT}`);
});
