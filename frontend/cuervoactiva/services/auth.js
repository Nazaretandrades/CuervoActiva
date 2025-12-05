// Archivo para registrar e iniciar sesión
//  URL del backend desplegado (Render)
const PROD_URL = "https://cuervoactiva.onrender.com";

// BASE_URL usará EXPO_PUBLIC_API_URL si existe (opcional),
// si no, usará directamente Render
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || PROD_URL;

// FUNCIÓN: Registrar un nuevo usuario
export async function registerUser({ name, email, password, role }) {
  try {
    const res = await fetch(`${BASE_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Error registrando usuario");
    }

    return data;
  } catch (err) {
    console.error("❌ Error de red:", err);
    throw new Error("Error de conexión con el servidor.");
  }
}

// FUNCIÓN: Iniciar sesión
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
    throw new Error(data?.error || "Error iniciando sesión");
  }

  return data;
}
