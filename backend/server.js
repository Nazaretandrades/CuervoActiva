import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Obtenemos __dirname en entorno ESM (ya que no está disponible por defecto)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargamos las variables de entorno desde el archivo .env
dotenv.config();

// Inicializamos la aplicación Express
const app = express();

// Middlewares base
// cors() → permite peticiones desde diferentes orígenes (útil para frontend móvil o web)
// express.json() → interpreta el cuerpo de las peticiones en formato JSON
app.use(cors());
app.use(express.json());

// Conectamos con la base de datos MongoDB
connectDB();

// Verificamos si la carpeta 'uploads' existe; si no, la creamos automáticamente
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log("📂 Carpeta 'uploads' creada automáticamente en", uploadsPath);
}

// Servimos la carpeta 'uploads' como pública
// Esto permite acceder a imágenes y archivos subidos desde el navegador o apps móviles
app.use("/uploads", express.static(uploadsPath));

// Importamos y registramos las rutas principales de la API
import userRoutes from "./routes/userRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import culturalRoutes from "./routes/culturalRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

// Asociamos las rutas a sus respectivos endpoints
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/cultural", culturalRoutes);
app.use("/api/contact", contactRoutes);

// Middleware de ruta no encontrada (404)
// Se ejecuta si ninguna ruta anterior coincide con la petición
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada", path: req.originalUrl });
});

// Configuración del servidor
const PORT = process.env.PORT || 5000;
const LOCAL_IP = process.env.LOCAL_IP || "192.168.18.19"; // Ajusta esta IP según tu red local

// Iniciamos el servidor y mostramos las URLs de acceso
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor corriendo correctamente:");
  console.log(`💻 Web: http://localhost:${PORT}`);
  console.log(`📱 Android (red local): http://${LOCAL_IP}:${PORT}`);
});
