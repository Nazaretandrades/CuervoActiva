const User = require('../models/user');//Se importa el modelo
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Registro
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    //Validar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    //Validar rol permitido (no se permite 'admin')
    const allowedRoles = ['user', 'organizer'];
    const finalRole = allowedRoles.includes(role) ? role : 'user';

    //Hashear contraseña
    const hashed = await bcrypt.hash(password, 10);

    //Crear usuario
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: finalRole
    });

    //Generar token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


//Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Perfil de usuario
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites attendedEvents');
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
