const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");
const fs = require("fs");

// Cargamos variables de entorno
dotenv.config();

// Inicializamos Express
const app = express();

// Detectar HTTPS detrás de Render
app.set("trust proxy", 1);

// ------------------------
// CONFIGURACIÓN CORS
// ------------------------
const allowedOrigins = [
  "https://cuervo-activa.vercel.app", // frontend producción
  "http://localhost:3000" // pruebas locales
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // permite Postman u otros scripts
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error(`CORS: origen ${origin} no permitido`), false);
    }
    return callback(null, true);
  },
  credentials: true, // necesario si se usan cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Para preflight en todas las rutas
app.options("*", cors());

// Middleware para parsear JSON
app.use(express.json());

// Conectamos a MongoDB
connectDB();

// Crear el administrador al inicio
const createAdminOnStart = require("./config/createAdminOnStart");
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
app.use("/uploads", express.static(uploadsPath));

// Importar rutas
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const commentRoutes = require("./routes/commentRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const culturalRoutes = require("./routes/culturalRoutes");
const contactRoutes = require("./routes/contactRoutes");

// Asociar rutas a endpoints
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cultural", culturalRoutes);
app.use("/api/contact", contactRoutes);

// Middleware 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada", path: req.originalUrl });
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