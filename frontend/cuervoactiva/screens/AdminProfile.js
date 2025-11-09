// frontend/src/screens/AdminProfile.js
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
  ScrollView,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { useNavigation } from "@react-navigation/native";

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";

export default function AdminProfile() {
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [adminName, setAdminName] = useState("Admin");

  // === Cargar usuario logueado ===
  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("USER_SESSION"));
        if (session?.name && session?.email) {
          setForm({ name: session.name, email: session.email });
          setAdminName(session.name);
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
      localStorage.setItem(
        "USER_SESSION",
        JSON.stringify({
          ...session,
          name: updatedUser.name,
          email: updatedUser.email,
        })
      );

      Alert.alert(
        "✅ Guardado",
        "Tu perfil ha sido actualizado correctamente."
      );
      setEditing(false);
      setAdminName(updatedUser.name);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      Alert.alert("Error", err.message);
    }
  };
  // === Cerrar sesión ===
  const handleLogout = async () => {
    try {
      // 🔹 Eliminar datos de sesión y flag del intro
      localStorage.removeItem("USER_SESSION");
      localStorage.removeItem("SEEN_INTRO");

      // 🔹 Reiniciar navegación completamente (sin volver atrás)
      navigation.reset({
        index: 0,
        routes: [{ name: "Intro" }],
      });
    } catch (err) {
      console.error("Error cerrando sesión:", err);
      Alert.alert("Error", "No se pudo cerrar sesión correctamente.");
    }
  };

  // === Navegaciones ===
  const goToProfile = () => navigation.navigate("AdminProfile");
  const goToNotifications = () => navigation.navigate("AdminNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToUsers = () => navigation.navigate("AdminUsers");

  // === Menú lateral ===
  const toggleMenu = () => {
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

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingVertical: 14,
          justifyContent: "space-between",
          backgroundColor: "#fff",
        }}
      >
        {/* Usuario */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              position: "relative",
              marginRight: 12,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#0094A2",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 24, height: 24, tintColor: "#fff" }}
            />
            <Image
              source={require("../assets/iconos/corona.png")}
              style={{
                position: "absolute",
                top: -12,
                left: -6,
                width: 22,
                height: 22,
                resizeMode: "contain",
              }}
            />
          </View>
          <View>
            <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
              Admin.
            </Text>
            <Text style={{ color: "#6c757d", fontSize: 13 }}>{adminName}</Text>
          </View>
        </View>

        {/* Iconos derecha */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={goToNotifications}
            style={{
              marginRight: 20,
              ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
            }}
          >
            <Image
              source={require("../assets/iconos/bell2.png")}
              style={{ width: 22, height: 22, tintColor: "#0094A2" }}
            />
          </Pressable>

          <Pressable
            onPress={goToCalendar}
            style={{
              marginRight: 20,
              ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
            }}
          >
            <Image
              source={require("../assets/iconos/calendar-admin.png")}
              style={{ width: 22, height: 22, tintColor: "#0094A2" }}
            />
          </Pressable>

          <Pressable
            onPress={toggleMenu}
            style={Platform.OS === "web" ? { cursor: "pointer" } : {}}
          >
            <Image
              source={
                menuVisible
                  ? require("../assets/iconos/close-admin.png")
                  : require("../assets/iconos/menu-admin.png")
              }
              style={{ width: 24, height: 24, tintColor: "#0094A2" }}
            />
          </Pressable>
        </View>
      </View>

      {/* === MENÚ LATERAL === */}
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
              { label: "Ver usuarios", action: goToUsers },
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

      {/* === CONTENIDO PERFIL === */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "flex-start", // 🔹 sube el contenido
          paddingVertical: 65, // 🔹 menos espacio arriba y abajo
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 8,
            width: "90%",
            maxWidth: 420,
            paddingVertical: 20, // 🔹 menos alto el recuadro
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 5,
            marginTop: 30, // 🔹 un poco más cerca del encabezado
          }}
        >
          {/* 🔹 TÍTULO PERFIL ENCIMA DEL ICONO */}
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#014869",
              marginBottom: 15,
            }}
          >
            Perfil
          </Text>

          {/* ICONO DE USUARIO CON CORONA */}
          <View
            style={{
              position: "relative",
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "#0094A2",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 36, height: 36, tintColor: "#fff" }}
            />
            <Image
              source={require("../assets/iconos/corona.png")}
              style={{
                position: "absolute",
                top: -14,
                left: -4,
                width: 26,
                height: 26,
                resizeMode: "contain",
              }}
            />
          </View>

          <View style={{ width: "80%" }}>
            <Text
              style={{ fontWeight: "bold", color: "#014869", marginBottom: 5 }}
            >
              Username:
            </Text>
            <TextInput
              editable={editing}
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 14,
                marginBottom: 15,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            />

            <Text
              style={{ fontWeight: "bold", color: "#014869", marginBottom: 5 }}
            >
              Email:
            </Text>
            <TextInput
              editable={editing}
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 14,
                marginBottom: 25,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginTop: 10,
              }}
            >
              <Pressable
                onPress={() => (editing ? handleSave() : setEditing(true))}
                style={{
                  backgroundColor: "#014869",
                  paddingVertical: 10,
                  paddingHorizontal: 25,
                  borderRadius: 30,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {editing ? "Guardar" : "Editar"}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                style={{
                  backgroundColor: "#014869",
                  paddingVertical: 10,
                  paddingHorizontal: 25,
                  borderRadius: 30,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Cerrar Sesión
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* === FOOTER === */}
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
