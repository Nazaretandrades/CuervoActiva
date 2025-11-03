const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notification = require("../models/notification");

// === REGISTRO DE USUARIO ===
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "El correo ya está registrado" });

    const allowedRoles = ["user", "organizer", "admin"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: finalRole,
    });

    // 📢 Notificación para admin
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
    res.status(400).json({ error: err.message });
  }
};

// === LOGIN ===
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      $or: [{ email }, { name: email }],
    });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

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

// === PERFIL ===
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

// === ADMIN: VER TODOS LOS USUARIOS ===
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "_id name email role"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// === ADMIN: ELIMINAR USUARIO ===
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // 🔎 Confirmar que el admin existe
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

    // 🗑️ Ahora sí, eliminamos el usuario
    await user.deleteOne();

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error en deleteUser:", err);
    res.status(500).json({ error: err.message });
  }
};


// === ACTUALIZAR PERFIL DE USUARIO ===
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const { name, email, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    await user.save();
    res.json({
      message: "Perfil actualizado correctamente",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

