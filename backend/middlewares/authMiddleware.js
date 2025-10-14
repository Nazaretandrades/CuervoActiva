const jwt = require('jsonwebtoken');
const User = require('../models/user');


/**
 * Middleware "auth"
 * Comprueba si el usuario está autenticado mediante un token JWT.
 */
const auth = async (req, res, next) => {
  let token;

  //1) Verifica que el header Authorization exista y empiece con "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      //2) Extrae el token (quita la palabra "Bearer")
      token = req.headers.authorization.split(' ')[1];

      //3) Verifica y decodifica el token con la clave secreta
      //Esto obtiene el payload que  incluye el "id" del usuario.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //4) Busca al usuario en la base de datos usando el id del token
      //y elimina el campo de contraseña del resultado por seguridad.
      req.user = await User.findById(decoded.id).select('-password');

      //5) Llama a next() → el control pasa al siguiente middleware o ruta
      next();
    } catch (err) {
      // Si el token es inválido o ha expirado, devuelve error 401
      return res.status(401).json({ error: 'Token inválido' });
    }
  } else {
    //Si no hay header Authorization o no empieza con Bearer, error 401
    return res.status(401).json({ error: 'Token faltante' });
  }
};

/**
 * Middleware "authorizeRoles"
 * Sirve para restringir el acceso de ciertas rutas solo a roles específicos.
 * 
 * Se usa junto con "auth".
 *
 * Solo los usuarios cuyo "req.user.role" coincida con alguno de los roles permitidos
 * podrán continuar, los demás recibirán un error 403.
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    //1) Comprueba que el rol del usuario esté dentro de los roles permitidos
    if (!roles.includes(req.user.role)) {
      //2) Si no tiene el rol, devuelve error 403 (Forbidden)
      return res
        .status(403)
        .json({ error: 'No tienes permisos para realizar esta acción' });
    }

    //3) Si pasa la verificación, continúa con la ejecución normal
    next();
  };
};

//Exportamos ambos middlewares para usarlos en las rutas
module.exports = { auth, authorizeRoles };
