// frontend/src/screens/OrganizerProfile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Alert,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OrganizerMenu from "./OrganizerMenu"; // ✅ añadido

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";

export default function OrganizerProfile() {
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [organizerName, setOrganizerName] = useState("Organizador");

  // === Cargar usuario logueado ===
  useEffect(() => {
    const loadUser = async () => {
      try {
        let session;
        if (Platform.OS === "web") {
          session = JSON.parse(localStorage.getItem("USER_SESSION"));
        } else {
          const s = await AsyncStorage.getItem("USER_SESSION");
          session = s ? JSON.parse(s) : null;
        }

        if (session?.name && session?.email) {
          setForm({ name: session.name, email: session.email });
          setOrganizerName(session.name);
        }
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };
    loadUser();
  }, []);

  // === Guardar cambios en BD ===
  const handleSave = async () => {
    try {
      let session;
      if (Platform.OS === "web") {
        session = JSON.parse(localStorage.getItem("USER_SESSION"));
      } else {
        const s = await AsyncStorage.getItem("USER_SESSION");
        session = s ? JSON.parse(s) : null;
      }

      if (!session?.token) {
        Alert.alert("Error", "No se encontró la sesión del organizador.");
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

      const updatedSession = {
        ...session,
        name: updatedUser.name,
        email: updatedUser.email,
      };

      if (Platform.OS === "web") {
        localStorage.setItem("USER_SESSION", JSON.stringify(updatedSession));
      } else {
        await AsyncStorage.setItem(
          "USER_SESSION",
          JSON.stringify(updatedSession)
        );
      }

      Alert.alert("✅ Guardado", "Tu perfil ha sido actualizado correctamente.");
      setEditing(false);
      setOrganizerName(updatedUser.name);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      Alert.alert("Error", err.message);
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

  // === Navegaciones ===
  const goToProfile = () => navigation.navigate("OrganizerProfile");
  const goToNotifications = () => navigation.navigate("OrganizerNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");

  // === Menú lateral ===
  const toggleMenu = () => {
    if (Platform.OS !== "web") {
      setMenuVisible(!menuVisible);
      return;
    }

    if (menuVisible) {
      Animated.timing(menuAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* === Barra superior (naranja) === */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text>👤</Text>
          <Text>{organizerName}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* 📅 CALENDARIO */}
          <Pressable onPress={goToCalendar} style={{ marginRight: 10 }}>
            <Image
              source={require("../assets/iconos/calendar-organizador.png")}
              style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
            />
          </Pressable>

          {/* 🔔 NOTIFICACIONES */}
          <Pressable onPress={goToNotifications} style={{ marginRight: 10 }}>
            <Image
              source={require("../assets/iconos/bell3.png")}
              style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
            />
          </Pressable>

          {/* ☰ MENÚ */}
          <Pressable onPress={toggleMenu}>
            <Image
              source={
                menuVisible
                  ? require("../assets/iconos/close-organizador.png")
                  : require("../assets/iconos/menu-organizador.png")
              }
              style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
            />
          </Pressable>
        </View>
      </View>

      {/* === Menú lateral web === */}
      {Platform.OS === "web" && menuVisible && (
        <>
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 9,
              }}
            />
          </TouchableWithoutFeedback>

          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 250,
              height: "100%",
              backgroundColor: "#f8f8f8",
              padding: 20,
              zIndex: 10,
              transform: [{ translateX: menuAnim }],
            }}
          >
            {[
              { label: "Perfil", action: goToProfile },
              { label: "Cultura e Historia", action: goToCulturaHistoria },
              { label: "Contacto", action: goToContact },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  toggleMenu();
                  item.action();
                }}
                style={{ marginBottom: 25 }}
              >
                <Text
                  style={{
                    color: "#014869",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </>
      )}

      {/* === Menú móvil (igual que Contacto y Calendar) === */}
      {Platform.OS !== "web" && menuVisible && (
        <OrganizerMenu onClose={toggleMenu} />
      )}

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
            tintColor: "#F3B23F",
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
                backgroundColor: "#F3B23F",
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

      {/* === Footer solo en web === */}
      {Platform.OS === "web" && (
        <Footer
          onAboutPress={goToAboutUs}
          onPrivacyPress={goToPrivacy}
          onConditionsPress={goToConditions}
        />
      )}
    </View>
  );
}
