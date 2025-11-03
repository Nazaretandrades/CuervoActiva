import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

// 🧠 Detectar plataforma y usar la IP local correcta
const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000" // ⚠️ <-- cambia esta IP por la tuya (la IPv4 de tu PC)
    : "http://localhost:5000";

export default function UserProfile({ navigation }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });

  // === Cargar usuario logueado ===
  useEffect(() => {
    const loadUser = async () => {
      try {
        let session;
        if (Platform.OS === "web") {
          session = JSON.parse(localStorage.getItem("USER_SESSION"));
        } else {
          const sessionString = await AsyncStorage.getItem("USER_SESSION");
          session = sessionString ? JSON.parse(sessionString) : null;
        }
        if (session?.name && session?.email)
          setForm({ name: session.name, email: session.email });
      } catch (err) {
        console.error("Error cargando usuario:", err);
      }
    };
    loadUser();
  }, []);

  // === Guardar cambios (actualizar en BD) ===
  const handleSave = async () => {
    try {
      let session;
      if (Platform.OS === "web") {
        session = JSON.parse(localStorage.getItem("USER_SESSION"));
      } else {
        const sessionString = await AsyncStorage.getItem("USER_SESSION");
        session = sessionString ? JSON.parse(sessionString) : null;
      }

      if (!session?.token) {
        Alert.alert("Error", "No hay sesión activa");
        return;
      }

      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar perfil");
      }

      const data = await res.json();

      // Actualizar sesión local
      const updatedSession = {
        ...session,
        name: data.name || form.name,
        email: data.email || form.email,
      };

      if (Platform.OS === "web") {
        localStorage.setItem("USER_SESSION", JSON.stringify(updatedSession));
      } else {
        await AsyncStorage.setItem(
          "USER_SESSION",
          JSON.stringify(updatedSession)
        );
      }

      Alert.alert("✅ Éxito", "Perfil actualizado correctamente");
      setEditing(false);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      Alert.alert(
        "Error",
        "No se pudo conectar con el servidor. Asegúrate de usar la IP correcta."
      );
    }
  };

  // === Cerrar sesión ===
  const handleLogout = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("USER_SESSION");
    } else {
      await AsyncStorage.removeItem("USER_SESSION");
    }
    navigation.navigate("Intro");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* === Encabezado === */}
      <View
        style={{
          backgroundColor: "#0072B5",
          paddingVertical: 14,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          Usuario
        </Text>
        <Image
          source={require("../assets/iconos/user.png")}
          style={{ width: 24, height: 24, tintColor: "#fff" }}
        />
      </View>

      {/* === Contenido principal === */}
      <View style={{ flex: 1, alignItems: "center", paddingTop: 30 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
          Perfil
        </Text>

        <Image
          source={require("../assets/iconos/user.png")}
          style={{
            width: 60,
            height: 60,
            tintColor: "#0072B5",
            marginBottom: 20,
          }}
        />

        <View style={{ width: "80%", maxWidth: 400 }}>
          <Text>Username:</Text>
          <TextInput
            editable={editing}
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              padding: 8,
              marginBottom: 15,
            }}
          />

          <Text>Email:</Text>
          <TextInput
            editable={editing}
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 10,
              padding: 8,
              marginBottom: 25,
            }}
          />

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Pressable
              onPress={() => (editing ? handleSave() : setEditing(true))}
              style={{
                backgroundColor: "#0072B5",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#fff" }}>
                {editing ? "Guardar" : "Editar"}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={{
                backgroundColor: "#444",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#fff" }}>Cerrar Sesión</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {Platform.OS === "web" && <Footer />}
    </View>
  );
}
