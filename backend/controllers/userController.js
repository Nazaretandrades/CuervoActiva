const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notification = require("../models/notification");

// === REGISTRO DE USUARIO ===
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Evitar duplicados
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "El correo ya está registrado" });

    // Rol permitido
    const allowedRoles = ["user", "organizer"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    // Crear usuario
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: finalRole,
    });

    // 📢 Notificación para admin
    const adminUser = await User.findOne({ role: "admin" });
    console.log("ADMIN ENCONTRADO:", adminUser?._id);

    if (adminUser) {
      const noti = await Notification.create({
        user: adminUser._id,
        message: `Se ha registrado un nuevo ${
          finalRole === "organizer" ? "organizador" : "usuario"
        }: ${user.name}`,
        type: "user_register",
        dateKey: new Date().toISOString(),
      });
      console.log("✅ Notificación creada:", noti);
    }

    // Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("❌ Error en registro:", err);
    res.status(400).json({ error: err.message });
  }
};

//Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    //Permitir login con email o username
    const user = await User.findOne({
      $or: [{ email }, { name: email }],
    });

    //Validar si se ha encontrado al usuario
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    //Comparar la contraseña para ver si es la misma
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
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

//Perfil de usuario
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "favorites attendedEvents"
    );
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
