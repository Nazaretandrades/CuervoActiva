const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware de autenticación
const auth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 🔹 Extraer token del header
      token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }

      // 🔹 Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 🔹 Buscar usuario
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.error("❌ Usuario no encontrado con ID:", decoded.id);
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      // 🔹 Asignar al request
      req.user = user;
      console.log("✅ Usuario autenticado:", user.email, "-", user.role);

      next();
    } catch (err) {
      console.error("❌ Error autenticando token:", err.message);
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
  } else {
    return res.status(401).json({ error: "Token faltante" });
  }
};

// Middleware de roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!roles.includes(req.user.role)) {
      console.error(
        `🚫 Usuario ${req.user.email} no autorizado (rol: ${req.user.role})`
      );
      return res
        .status(403)
        .json({ error: "No tienes permisos para realizar esta acción" });
    }

    next();
  };
};

module.exports = { auth, authorizeRoles };