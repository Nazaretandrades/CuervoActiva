const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const path = require("path");

// Cargamos las variables de entorno desde el archivo .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Función: seedAdmin
 * Crea un usuario administrador por defecto en la base de datos.
 * Si existe un administrador previo, lo elimina para evitar duplicados.
 */
const seedAdmin = async () => {
  // Eliminamos cualquier administrador existente
  await User.deleteMany({ role: "admin" });

  // Encriptamos la contraseña con un "salt" de 10 rondas
  const adminPassword = await bcrypt.hash("cuervobd", 10);

  // Creamos el nuevo usuario administrador con los datos predeterminados
  const admin = new User({
    name: "Nazaret", // Nombre visible del administrador
    email: "nazaret545andradesgonzalez@gmail.com", // Correo del admin
    password: adminPassword, // Contraseña encriptada
    role: "admin", // Rol con permisos de administrador
    favorites: [], // Inicializamos campos opcionales vacíos
    attendedEvents: [],
  });

  // Guardamos el nuevo administrador en MongoDB
  await admin.save();
  console.log("✅ Administrador seed creado correctamente");
};

/**
 * Función principal: seedDatabase
 * Se encarga de:
 * 1️ Conectar a la base de datos MongoDB.
 * 2️ Ejecutar el proceso de creación del administrador.
 * 3️ Cerrar la conexión una vez completado el proceso.
 */
const seedDatabase = async () => {
  try {
    // 1️ Conectamos con MongoDB usando la URI del archivo .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🌐 Conexión con MongoDB establecida");

    // 2️ Creamos el usuario administrador por defecto
    await seedAdmin();

    // 3️ Cerramos la conexión con la base de datos
    await mongoose.disconnect();
    console.log("✅ Seed completado y conexión cerrada");
  } catch (err) {
    // Si ocurre algún error, lo mostramos y cerramos la conexión por seguridad
    console.error("❌ Error durante el seed:", err);
    await mongoose.disconnect();
  }
};

// Ejecutamos la función principal al correr este script
seedDatabase();
