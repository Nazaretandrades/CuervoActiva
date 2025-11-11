import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const STORAGE_KEY = "USER_SESSION";

// Guardar sesión
export const saveSession = async (data) => {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (err) {
    console.error("Error guardando sesión:", err);
  }
};

// Obtener sesión
export const getSession = async () => {
  try {
    if (Platform.OS === "web") {
      const session = localStorage.getItem(STORAGE_KEY);
      return session ? JSON.parse(session) : null;
    } else {
      const session = await AsyncStorage.getItem(STORAGE_KEY);
      return session ? JSON.parse(session) : null;
    }
  } catch (err) {
    console.error("Error leyendo sesión:", err);
    return null;
  }
};

// Borrar sesión
export const clearSession = async () => {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch (err) {
    console.error("Error eliminando sesión:", err);
  }
};
