import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Image, Alert, Platform } from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";

export default function AdminProfile({ navigation }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });

  // === Cargar usuario logueado ===
  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("USER_SESSION"));
        if (session?.name && session?.email)
          setForm({ name: session.name, email: session.email });
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };
    loadUser();
  }, []);

  // === Guardar cambios en BD ===
  const handleSave = async () => {
    try {
      const session = JSON.parse(localStorage.getItem("USER_SESSION"));
      if (!session?.token) {
        Alert.alert("Error", "No se encontró la sesión del administrador.");
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

      if (!res.ok) throw new Error("Error al guardar en la base de datos");

      const updatedUser = await res.json();
      localStorage.setItem("USER_SESSION", JSON.stringify({
        ...session,
        name: updatedUser.name,
        email: updatedUser.email,
      }));

      Alert.alert("✅ Guardado", "Tu perfil ha sido actualizado correctamente.");
      setEditing(false);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      Alert.alert("Error", err.message);
    }
  };

  // === Cerrar sesión ===
  const handleLogout = () => {
    localStorage.removeItem("USER_SESSION");
    navigation.navigate("Intro");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* === Encabezado === */}
      <View
        style={{
          backgroundColor: "#014869",
          paddingVertical: 14,
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
          Administrador
        </Text>
        <Image
          source={require("../assets/iconos/user.png")}
          style={{ width: 24, height: 24, tintColor: "#fff" }}
        />
      </View>

      {/* === Contenido === */}
      <View style={{ flex: 1, alignItems: "center", paddingTop: 30 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
          Perfil
        </Text>

        <Image
          source={require("../assets/iconos/user.png")}
          style={{
            width: 60,
            height: 60,
            tintColor: "#014869",
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
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              onPress={() => (editing ? handleSave() : setEditing(true))}
              style={{
                backgroundColor: "#014869",
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

      <Footer />
    </View>
  );
}
