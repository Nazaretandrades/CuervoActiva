import { Platform } from "react-native";

// 🔧 Detecta automáticamente si estás en web o móvil:
const LOCAL_PC_IP = "192.168.18.19"; // <-- tu IP local aquí
const PORT = 5000;

const API_URL =
  Platform.OS === "web"
    ? "http://localhost:" + PORT // navegador → localhost
    : `http://${LOCAL_PC_IP}:${PORT}`; // móvil/emulador → IP del PC

// Puedes sobreescribir con variable de entorno si usas producción
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || API_URL;

// ------------------------------
// 📦 REGISTRO DE USUARIO
// ------------------------------
export async function registerUser({ name, email, password, role }) {
  try {
    const res = await fetch(`${BASE_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    // Parsear respuesta
    const data = await res.json();

    if (!res.ok) {
      const msg = data?.error || "Error registrando usuario";
      throw new Error(msg);
    }

    return data; // { id, name, email, role, token }
  } catch (err) {
    console.error("❌ Error de red:", err);
    throw new Error("Error de conexión con el servidor.");
  }
}

export async function loginUser({ emailOrUsername, password }) {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailOrUsername,
      password,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error || "Error iniciando sesión";
    throw new Error(msg);
  }
  return data; // { id, name, email, role, token }
}
