// Archivo para registrar e iniciar sesión
import { Platform } from "react-native";
// Puerto donde corre el backend en Express.js
const PORT = 5000;

// Api según la plataforma
const API_URL =
  Platform.OS === "android"
    ? `http://10.0.2.2:${PORT}`
    : Platform.OS === "web"
    ? `http://localhost:${PORT}`
    : `http://192.168.18.19:${PORT}`;

// BASE_URL con variable de entorno (para producción)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || API_URL;

//FUNCIÓN: Registrar un nuevo usuario
export async function registerUser({ name, email, password, role }) {
  try {
    //Enviamos una solicitud POST al endpoint /api/users/register
    const res = await fetch(`${BASE_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }, //JSON en el cuerpo
      body: JSON.stringify({ name, email, password, role }), //Datos del usuario
    });

    //Convertimos la respuesta del servidor a JSON
    const data = await res.json();

    //Si la respuesta no fue exitosa (status !== 200 OK)
    if (!res.ok) {
      const msg = data?.error || "Error registrando usuario";
      throw new Error(msg); //Lanzamos un error que será capturado en el frontend
    }

    //Devolvemos los datos recibidos del servidor
    return data;
  } catch (err) {
    //Si el servidor no responde o hay un error de conexión
    console.error("❌ Error de red:", err);
    throw new Error("Error de conexión con el servidor.");
  }
}

//FUNCIÓN: Iniciar sesión (login)
export async function loginUser({ emailOrUsername, password }) {
  //Enviamos solicitud POST al endpoint /api/users/login
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailOrUsername, //Puede ser el correo o el nombre de usuario
      password, //Contraseña del usuario
    }),
  });

  //Convertimos la respuesta a JSON
  const data = await res.json();

  //Validamos que la respuesta sea exitosa
  if (!res.ok) {
    const msg = data?.error || "Error iniciando sesión";
    throw new Error(msg);
  }

  // Devolvemos los datos del usuario autenticado
  return data;
}
