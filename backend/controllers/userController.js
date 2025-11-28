const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Notification = require("../models/notification");

// REGISTRO DE USUARIO 
// REGISTRO DE USUARIO 
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ===============================
    // 🔎 VALIDACIONES BACKEND
    // ===============================

    // Nombre obligatorio
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    if (name.trim().length < 3) {
      return res.status(400).json({ error: "El nombre debe tener al menos 3 caracteres" });
    }

    // Email obligatorio
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "El correo es obligatorio" });
    }

    // Formato válido de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de correo inválido" });
    }

    // Contraseña obligatoria
    if (!password || !password.trim()) {
      return res.status(400).json({ error: "La contraseña es obligatoria" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Rol válido (ignora "admin" desde el registro para seguridad)
    const allowedRoles = ["user", "organizer"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    // Email repetido
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // ===============================
    // 🛠 CREACIÓN DEL USUARIO
    // ===============================

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: finalRole,
    });

    // ===============================
    // 🔔 Crear notificación a admin
    // ===============================
    const adminUser = await User.findOne({ role: "admin" });

    if (adminUser) {
      await Notification.create({
        user: adminUser._id,
        message: `Se ha registrado un nuevo ${finalRole === "organizer" ? "organizador" : "usuario"}: ${user.name}`,
        type: "user_register",
        dateKey: new Date().toISOString(),
      });
    }

    // ===============================
    // 🔑 Generación del token
    // ===============================
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ===============================
    // 📤 Respuesta final
    // ===============================
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });

  } catch (err) {
    console.error("❌ Error en registerUser:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// LOGIN 
// LOGIN 
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ===============================
    // 🔎 VALIDACIONES
    // ===============================

    // Email obligatorio
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "El correo es obligatorio" });
    }

    // Contraseña obligatoria
    if (!password || !password.trim()) {
      return res.status(400).json({ error: "La contraseña es obligatoria" });
    }

    // Buscar por correo o username
    const user = await User.findOne({
      $or: [{ email }, { name: email }],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Comparar contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respuesta
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });

  } catch (err) {
    console.error("❌ Error en loginUser:", err);
    res.status(500).json({ error: "Error interno del servidor" });
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


// ADMIN: CREAR USUARIO MANUALMENTE
exports.createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ===============================
    // 🔎 VALIDACIONES
    // ===============================

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: "El correo es obligatorio" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de correo inválido" });
    }

    if (!password || !password.trim()) {
      return res.status(400).json({ error: "La contraseña es obligatoria" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Roles permitidos por admin
    const allowedRoles = ["user", "organizer"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    // Email repetido
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "El correo ya existe" });
    }

    // Crear usuario
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: finalRole,
    });

    res.status(201).json(user);

  } catch (err) {
    console.error("❌ Error en createUserByAdmin:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};


// ADMIN: EDITAR USUARIO
exports.updateUserByAdmin = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // ===============================
    // 🔎 VALIDACIONES
    // ===============================

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ error: "El nombre no puede estar vacío" });
      }
      if (name.trim().length < 3) {
        return res.status(400).json({ error: "El nombre debe tener al menos 3 caracteres" });
      }
      user.name = name;
    }

    if (email !== undefined) {
      if (!email.trim()) {
        return res.status(400).json({ error: "El email no puede estar vacío" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Correo inválido" });
      }

      // Evitar que dos usuarios tengan el mismo email
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) {
        return res.status(400).json({ error: "Ese correo ya está en uso por otro usuario" });
      }

      user.email = email;
    }

    if (role !== undefined) {
      const allowedRoles = ["user", "organizer"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: "Rol no válido" });
      }
      user.role = role;
    }

    if (password !== undefined && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          error: "La contraseña debe tener al menos 6 caracteres",
        });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    // Guardar cambios
    await user.save();

    res.json(user);

  } catch (err) {
    console.error("❌ Error en updateUserByAdmin:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// ACTUALIZAR PERFIL PROPIO (por ejemplo admin editar su nombre)
exports.updateOwnProfile = async (req, res) => {
  try {
    const { name } = req.body;

    // Solo permitimos cambiar nombre aquí (email/rol/contraseña NO)
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    if (name.trim().length < 3) {
      return res
        .status(400)
        .json({ error: "El nombre debe tener al menos 3 caracteres" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    user.name = name.trim();
    await user.save();

    // devolvemos solo lo que necesitamos
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("❌ Error en updateOwnProfile:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
