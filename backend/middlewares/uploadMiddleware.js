const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Ruta de uploads dinámica según entorno
// En producción (Render) usará /var/data/uploads
// En local seguirá usando /uploads
const uploadDir = process.env.UPLOAD_PATH 
  ? path.resolve(process.env.UPLOAD_PATH)
  : path.resolve(__dirname, "../uploads");

// Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Carpeta 'uploads' creada automáticamente en:", uploadDir);
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Solo se permiten archivos de imagen"), false);
};

module.exports = multer({ storage, fileFilter });
