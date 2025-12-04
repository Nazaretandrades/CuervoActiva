// Importo el encriptador
const bcrypt = require("bcryptjs");
// Importo el modelo de Usuario
const User = require("../models/user");

const createAdminOnStart = async () => {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("🔹 Admin ya existe. No se crea uno nuevo.");
      return;
    }

    // Crear admin si no existe
    const hashedPassword = await bcrypt.hash("nazaret", 10);

    const admin = await User.create({
      name: "Nazaret",
      email: "nazaret545andradesgonzalez@gmail.com",
      password: hashedPassword,
      role: "admin",
      favorites: [],
      attendedEvents: [],
    });

    console.log("✅ Admin creado automáticamente:", admin.email);
  } catch (error) {
    console.error("❌ Error creando admin automáticamente:", error);
  }
};

module.exports = createAdminOnStart;
