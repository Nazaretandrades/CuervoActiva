// Importa la librería mongoose, que permite trabajar con MongoDB.
const mongoose = require('mongoose');
// Carga las variables de entorno (paquete dotenv que se usa para leer el archivo .env)
const dotenv = require('dotenv');
// Ejecuta la función config (), que carga esas variables.
dotenv.config();

// Función asíncrona para conectar mi app a mongodb
const connectDB = async () => {
  try {
    // Con esto se realiza la conexión
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Obliga a usar el nuevo parser del driver de MongoDB
      useUnifiedTopology: true // Activa el nuevo motor de topología de MongoDB
    });
    // Si se conecta lanzará este mensaje en la consola sino captará un error y terminará el proceso
    console.log('MongoDB Atlas conectado correctamente');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

//Se exporta la función para poder usarla
module.exports = connectDB;

/*Este archivo es el módulo de conexión a MongoDB. Se encarga de:
Leer la URI de la base de datos desde .env.
Intentar la conexión con Mongoose.
Mostrar si se conectó bien o abortar si falló.*/