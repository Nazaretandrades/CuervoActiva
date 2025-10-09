const mongoose = require('mongoose');
const dotenv = require('dotenv'); //Carga las variables de entorno 
dotenv.config();

//Función asíncrona para conectar mi app a mongodb
const connectDB = async () => {
  try {
    //Con esto se realiza la conexión
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    //Si se conecta lanzará este mensaje en la consola sino captará un error y terminará el proceso
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