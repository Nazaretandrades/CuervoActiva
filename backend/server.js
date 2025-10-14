//PUNTO DE ENTRADA DEL BACKEND

//1) Importamos las dependencias necesarias
const express = require("express"); //Framework web para crear el servidor y las rutas
const cors = require("cors"); //Permite que el frontend se comunique con el backend (CORS)
const connectDB = require("./config/db"); //Función para conectar con MongoDB
require("dotenv").config(); //Carga las variables de entorno desde el archivo .env

//2) Inicializamos la aplicación Express
const app = express();

//3) Middlewares globales
//Habilitamos CORS
//Esto permite que el frontend pueda hacer peticiones HTTP a este servidor sin ser bloqueado.
app.use(cors());

//Middleware para interpretar datos JSON
//Permite que Express lea el cuerpo (body) de las peticiones en formato JSON.
app.use(express.json());

//4)Conexión a la base de datos
//Llamamos a la función que conecta a MongoDB usando Mongoose.
//Esta función está definida en /config/db.js
connectDB();

//5) Definición de rutas principales
//RUTAS DE USUARIOS — Registro, Login, Perfil
app.use("/api/users", require("./routes/userRoutes"));

//RUTAS DE EVENTOS — Crear, listar, editar y eliminar eventos
app.use("/api/events", require("./routes/eventRoutes"));

//RUTAS DE COMENTARIOS — Agregar y listar comentarios de los eventos
app.use("/api/comments", require("./routes/commentRoutes"));

//RUTAS DE FAVORITOS — Agregar, quitar y listar eventos favoritos
app.use("/api/favorites", require("./routes/favoriteRoutes"));

//RUTAS DE NOTIFICACIONES — Mostrar recordatorios y marcarlas como leídas
app.use("/api/notifications", require("./routes/notificationRoutes"));

//RUTAS CULTURALES — Listar artículos, noticias o secciones culturales
app.use("/api/cultural", require("./routes/culturalRoutes"));

//6) Puerto y arranque del servidor
//Definimos el puerto en el que se ejecutará el servidor.
const PORT = process.env.PORT || 5000;

//Iniciamos el servidor escuchando el puerto definido.
//Cuando esté en ejecución correctamente, mostrará un mensaje en la consola.
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
