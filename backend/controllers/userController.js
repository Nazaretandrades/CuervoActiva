// Importo el modelo User
const User = require("../models/user");
// Importo bcryptjs, librería para encriptar contraseñas
const bcrypt = require("bcryptjs");
// Importo jsonwebtoken, usado para generar JWT (tokens)
const jwt = require("jsonwebtoken");
// Importo el modelo Notification
const Notification = require("../models/notification");

// Registro de los usuarios
exports.registerUser = async (req, res) => {
  try {
    // Obtiene los campos enviados desde el frontend
    const { name, email, password, role } = req.body;

    // Nombre obligatorio
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    // El nombre tiene que ser mas de tres caracteres
    if (name.trim().length < 3) {
      return res
        .status(400)
        .json({ error: "El nombre debe tener al menos 3 caracteres" });
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
    // La contraseña debe tener al menos 6 caracteres
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    // Rol válido (ignora "admin" desde el registro para seguridad)
    const allowedRoles = ["user", "organizer"];
    // Si intentan enviar "admin" -> el backend lo ignora y convierte el rol a "user"
    const finalRole = allowedRoles.includes(role) ? role : "user";
    // Email repetido
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Encripto la contraseña (10 es el salt que determina la complejidad del hash)
    const hashed = await bcrypt.hash(password, 10);

    // Creo al usuario en la base de datos
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: finalRole,
    });

    // Se crea la notificación al Administrador, de que se ha registrado un nuevo Usuario.
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

    // Creo el token y expira en 1 hora
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET, // Clave que sirve para firmar los tokens
      { expiresIn: "1h" }
    );

    // Se envía la respuesta al frontend
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

// Inicio de sesión de los usuarios
exports.loginUser = async (req, res) => {
  try {
    // Cojo el email y el password del body del formulario
    const { email, password } = req.body;

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
    // Sino existe
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Comparar contraseña que escribe el usuario con la que se guardó en base de datos
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Creo el token y expira en 1 hora
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET, // Clave que sirve para firmar los tokens
      { expiresIn: "1h" }
    );

    // Respuesta que se envía al frontend
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

// Perfil de los usuarios
exports.getProfile = async (req, res) => {
  try {
    // Busco el perfil del usuario logueado, incluyendo favoritos y eventos asistidos
    const user = await User.findById(req.user.id).populate(
      "favorites attendedEvents"
    );
    // Sino existe
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Devuelvo toda la información del perfil
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ver todos los usuarios (Administrador)
exports.getAllUsers = async (req, res) => {
  try {
    // Listo todos los usuarios excepto los administradores
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "_id name email role"
    );

    // Devuelvo los usuarios
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar usuarios (Administrador)
exports.deleteUser = async (req, res) => {
  try {
    // Verifico que el usuario a eliminar exista
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Busco un admin para notificarle la eliminación
    const adminUser = await User.findOne({ role: "admin" });
    if (adminUser) {
      console.log("📢 Creando notificación de eliminación...");

      // Se crea la notificación para el administrador
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

    // Envío la respuesta al frontend
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error en deleteUser:", err);
    res.status(500).json({ error: err.message });
  }
};

// Crear usuario manualmente (Administrador)
exports.createUserByAdmin = async (req, res) => {
  try {
    // Cojo el nombre, email, contraseña y el rol del formulario
    const { name, email, password, role } = req.body;

    // El nombre es obligatorio
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    // El email es obligatorio
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "El correo es obligatorio" });
    }
    // Regex del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de correo inválido" });
    }
    // La contraseña es obligatoria
    if (!password || !password.trim()) {
      return res.status(400).json({ error: "La contraseña es obligatoria" });
    }
    // La contraseña debe tener al menos 6 catacteres
    if (password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Roles permitidos por admin
    const allowedRoles = ["user", "organizer"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    // Verificar si el email está repetido
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "El correo ya existe" });
    }

    // Crear usuario con la contraseña hasheada
    const hashed = await bcrypt.hash(password, 10);

    // Creamos al usuario
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: finalRole,
    });

    // Obtenemos al usuario y la respuesta
    res.status(201).json(user);
  } catch (err) {
    console.error("❌ Error en createUserByAdmin:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Editar usuario manualmente (Administrador)
exports.updateUserByAdmin = async (req, res) => {
  try {
    // Cojo los campos necesarios del formulario
    const { name, email, role, password } = req.body;
    // Valido si ese usuario existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // El nombre no debe estar vacío
    if (name !== undefined) {
      if (!name.trim()) {
        return res
          .status(400)
          .json({ error: "El nombre no puede estar vacío" });
      }
      // Debe tener al menos 3 caracteres
      if (name.trim().length < 3) {
        return res
          .status(400)
          .json({ error: "El nombre debe tener al menos 3 caracteres" });
      }
      user.name = name;
    }

    // El eamil no debe estar vacío
    if (email !== undefined) {
      if (!email.trim()) {
        return res.status(400).json({ error: "El email no puede estar vacío" });
      }
      // Regex del email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Correo inválido" });
      }

      // Evitar que dos usuarios tengan el mismo email
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) {
        return res
          .status(400)
          .json({ error: "Ese correo ya está en uso por otro usuario" });
      }

      user.email = email;
    }

    // Verificar los roles
    if (role !== undefined) {
      const allowedRoles = ["user", "organizer"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ error: "Rol no válido" });
      }
      user.role = role;
    }

    // Verificar la contraseña y que tenga al menos 6 caracteres
    if (password !== undefined && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({
          error: "La contraseña debe tener al menos 6 caracteres",
        });
      }
      // Se hashea la contraseña
      user.password = await bcrypt.hash(password, 10);
    }

    // Guardar cambios
    await user.save();

    // Devuelve la respuesta, el usuario
    res.json(user);
  } catch (err) {
    console.error("❌ Error en updateUserByAdmin:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Editar su propio perfil (Administrador, Organizador y Usuario normal)
exports.updateOwnProfile = async (req, res) => {
  try {
    // Cojo el nombre de usuario
    const { name } = req.body;

    // Solo permitimos cambiar nombre (email/rol/contraseña NO)
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    // El nombre debe tener al menos 3 caracteres
    if (name.trim().length < 3) {
      return res
        .status(400)
        .json({ error: "El nombre debe tener al menos 3 caracteres" });
    }

    // Busco al usuario
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    // Guardo el nombre del usuario y el usuario
    user.name = name.trim();
    await user.save();

    // Devolvemos solo lo que necesitamos
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
