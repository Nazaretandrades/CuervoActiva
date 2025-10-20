const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📁 Definimos la ruta absoluta de la carpeta uploads
const uploadDir = path.resolve(__dirname, "../uploads");

// 🧠 Verificamos que exista o la creamos
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Carpeta 'uploads' creada automáticamente en:", uploadDir);
}

// ⚙️ Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// 🔍 Aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Solo se permiten archivos de imagen"), false);
};

// 🚀 Crear el middleware
const upload = multer({ storage, fileFilter });

module.exports = upload;
