const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notification = require("../models/notification");

// REGISTRO DE USUARIO 
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Verifico si el correo ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "El correo ya está registrado" });

    // Solo permito roles válidos, por defecto 'user'
    const allowedRoles = ["user", "organizer", "admin"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    // Encripto la contraseña antes de guardar
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: finalRole,
    });

    // Creo una notificación para el admin cuando se registra un nuevo usuario
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      await Notification.create({
        user: adminUser._id,
        message: `Se ha registrado un nuevo ${
          finalRole === "organizer" ? "organizador" : "usuario"
        }: ${user.name}`,
        type: "user_register",
        dateKey: new Date().toISOString(),
      });
    }

    // Genero el token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Devuelvo los datos básicos del usuario junto con el token
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// LOGIN 
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Permito iniciar sesión usando el email o el nombre de usuario
    const user = await User.findOne({
      $or: [{ email }, { name: email }],
    });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Comparo la contraseña ingresada con la almacenada
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

    // Genero el token de autenticación
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Devuelvo los datos del usuario y su token
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PERFIL 
exports.getProfile = async (req, res) => {
  try {
    // Busco el perfil del usuario logueado, incluyendo favoritos y eventos asistidos
    const user = await User.findById(req.user.id).populate(
      "favorites attendedEvents"
    );

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Devuelvo toda la información del perfil
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: VER TODOS LOS USUARIOS 
exports.getAllUsers = async (req, res) => {
  try {
    // Listo todos los usuarios excepto los administradores
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "_id name email role"
    );

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: ELIMINAR USUARIO 
exports.deleteUser = async (req, res) => {
  try {
    // Verifico que el usuario a eliminar exista
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Busco un admin para notificarle la eliminación
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      console.log("📢 Creando notificación de eliminación...");

      await Notification.create({
        user: adminUser._id,
        message: `El usuario "${user.name}" ha sido eliminado del sistema.`,
        type: "user_deleted",
        dateKey: new Date().toISOString(),
      });

      console.log("✅ Notificación creada correctamente");
    } else {
      console.warn("⚠️ No se encontró usuario con rol 'admin'");
    }

    // Elimino el usuario definitivamente
    await user.deleteOne();

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error en deleteUser:", err);
    res.status(500).json({ error: err.message });
  }
};
