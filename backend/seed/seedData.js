const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const path = require('path');


dotenv.config({ path: path.resolve(__dirname, '../.env') });

const seedAdmin = async () => {
  await User.deleteMany({ role: 'admin' }); // limpiar admin si existe

  const adminPassword = await bcrypt.hash('cuervobd', 10);
  const admin = new User({
    name: 'Nazaret',
    email: 'nazaret545andradesgonzalez@gmail.com',
    password: adminPassword,
    role: 'admin',
    favorites: [],
    attendedEvents: []
  });

  await admin.save();
  console.log('Administrador seed creado');
};

// Conexión a MongoDB y ejecución
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado');

    await seedAdmin();

    await mongoose.disconnect()
    console.log('Seed completado y desconectado');
  } catch (err) {
    console.error(err);
    await mongoose.disconnect()
  }
};

seedDatabase();