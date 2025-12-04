// Importo la librería para verificar tokens JWT
const jwt = require("jsonwebtoken");
// Importo el modelo User
const User = require("../models/user");

// Middleware de autenticación (verifica el token JWT)
// Recibe solicitud del usuario, respuesta y continuar al siguiente middleware/controlador.
const auth = async (req, res, next) => {
  // Variable donde se guardará el token
  let token;
  // Verifico si el header de autorización está presente y usa el formato Bearer 
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extraigo el token del header de la posición 1 
      token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }

      // Verifico que el token sea válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busco al usuario asociado al token
      const user = await User.findById(decoded.id).select("-password"); // Se oculta la contraseña para mayor seguridad
      if (!user) {
        console.error("❌ Usuario no encontrado con ID:", decoded.id);
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      // Asigno la info del usuario al objeto `req` para usarla en las rutas protegidas
      req.user = user;
      console.log("✅ Usuario autenticado:", user.email, "-", user.role);

      next(); // Paso al siguiente middleware o controlador
    } catch (err) {
      console.error("❌ Error autenticando token:", err.message);
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
  } else {
    // Si no hay header de autorización, devuelvo error
    return res.status(401).json({ error: "Token faltante" });
  }
};

// Middleware para restringir acceso según rol
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Verifico que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // Compruebo si el rol del usuario está dentro de los permitidos
    if (!roles.includes(req.user.role)) {
      console.error(
        `🚫 Usuario ${req.user.email} no autorizado (rol: ${req.user.role})`
      );
      return res
        .status(403)
        .json({ error: "No tienes permisos para realizar esta acción" });
    }

    // Si pasa todas las validaciones, continúa con la solicitud
    next();
  };
};

// Exporto ambos middlewares para usarlos en las rutas
module.exports = { auth, authorizeRoles };
