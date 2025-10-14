//Importamos las dependencias necesarias
const mongoose = require('mongoose');   //Para conectarnos y operar con MongoDB
const dotenv = require('dotenv');       //Para leer variables del archivo .env
const bcrypt = require('bcryptjs');     //Para encriptar la contraseña del admin
const User = require('../models/user'); //Modelo de Usuario
const path = require('path');           //Para resolver rutas absolutas de archivos

//Cargamos las variables de entorno desde el archivo .env 
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Función: seedAdmin
 * Crea un usuario administrador por defecto en la base de datos.
 */
const seedAdmin = async () => {
  // Eliminamos cualquier admin anterior para evitar duplicados
  await User.deleteMany({ role: 'admin' }); 

  //Encriptamos la contraseña con un "salt" de 10 rondas
  const adminPassword = await bcrypt.hash('cuervobd', 10);

  //Creamos un nuevo usuario administrador
  const admin = new User({
    name: 'Nazaret',  //Nombre visible del administrador
    email: 'nazaret545andradesgonzalez@gmail.com',  //Correo del admin
    password: adminPassword,  //Contraseña encriptada
    role: 'admin',            //Rol con permisos de administrador
    favorites: [],            //Campos opcionales inicializados vacíos
    attendedEvents: []
  });

  //Guardamos el administrador en MongoDB
  await admin.save();
  console.log('✅ Administrador seed creado');
};

/**
 * Función principal: seedDatabase
 * Se encarga de conectar a la base de datos MongoDB,
 * ejecutar el proceso de creación del admin y luego cerrar la conexión.
 */
const seedDatabase = async () => {
  try {
    //1) Conexión con MongoDB usando la URI del archivo .env
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌐 MongoDB conectado');

    //2) Llamamos a la función que crea el admin
    await seedAdmin();

    //3) Cerramos la conexión con la base de datos
    await mongoose.disconnect();
    console.log('✅ Seed completado y desconectado');
  } catch (err) {
    //Si hay un error, lo mostramos y cerramos la conexión
    console.error('❌ Error durante el seed:', err);
    await mongoose.disconnect();
  }
};

//Ejecutamos la función principal al correr este script
seedDatabase();
