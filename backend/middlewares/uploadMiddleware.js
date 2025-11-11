const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Defino la ruta absoluta donde se guardarán los archivos subidos
const uploadDir = path.resolve(__dirname, "../uploads");

// Verifico si la carpeta 'uploads' existe; si no, la creo automáticamente
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Carpeta 'uploads' creada automáticamente en:", uploadDir);
}

// Configuración del almacenamiento de archivos con Multer
const storage = multer.diskStorage({
  // Directorio de destino para los archivos
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // Nombre del archivo al guardarlo (uso un sufijo único para evitar colisiones)
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Solo se permiten archivos de imagen"), false);
};

// Creo el middleware de carga con la configuración anterior
const upload = multer({ storage, fileFilter });

// Exporto el middleware para usarlo en las rutas (por ejemplo, al subir imágenes de eventos)
module.exports = upload;
