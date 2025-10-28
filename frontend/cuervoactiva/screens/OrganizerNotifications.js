import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";

export default function OrganizerNotifications({ navigation }) {
  const [userName, setUserName] = useState("Organizador");
  const [notifications, setNotifications] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // === Obtener usuario logueado ===
  useEffect(() => {
    const loadUser = async () => {
      try {
        const session =
          Platform.OS === "web"
            ? JSON.parse(localStorage.getItem("USER_SESSION"))
            : JSON.parse(await AsyncStorage.getItem("USER_SESSION"));
        if (session?.user?.name || session?.name)
          setUserName(session.user?.name || session.name);
      } catch {
        setUserName("Organizador");
      }
    };
    loadUser();
  }, []);

  // === Cargar notificaciones ===
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const session =
          Platform.OS === "web"
            ? JSON.parse(localStorage.getItem("USER_SESSION"))
            : JSON.parse(await AsyncStorage.getItem("USER_SESSION"));
        const token = session?.token;

        const res = await fetch(`${API_BASE}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
      }
    };
    loadNotifications();
  }, []);

  // === Marcar como leída ===
  const markAsRead = async (id) => {
    try {
      const session =
        Platform.OS === "web"
          ? JSON.parse(localStorage.getItem("USER_SESSION"))
          : JSON.parse(await AsyncStorage.getItem("USER_SESSION"));
      const token = session?.token;

      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al marcar como leída");

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );

      if (Platform.OS === "web") {
        alert("✅ Notificación marcada como leída");
      } else {
        Alert.alert("✅ Hecho", "La notificación se ha marcado como leída.");
      }
    } catch (err) {
      console.error("Error al marcar notificación como leída:", err);
      if (Platform.OS === "web") {
        alert("❌ Error al marcar notificación como leída");
      } else {
        Alert.alert("Error", "No se pudo marcar como leída.");
      }
    }
  };

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

  const simulateNavigation = (route) => {
    toggleMenu();
    Platform.OS === "web"
      ? alert(`Iría a: ${route}`)
      : Alert.alert("Navegación simulada", route);
  };

  const goToOrganizer = () => {
    toggleMenu();
    navigation.navigate("Organizer");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* === BARRA SUPERIOR === */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        {/* Usuario */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text>👤</Text>
          <Text style={{ fontWeight: "600", color: "#014869" }}>
            {userName}
          </Text>
        </View>

        {/* Menú + Notificaciones (lado derecho) */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          {/* 🔔 Icono Notificaciones (ya estás aquí, inactivo) */}
          <Pressable>
            <Image
              source={require("../assets/iconos/bell.png")}
              style={{ width: 26, height: 26, tintColor: "#F3B23F", opacity: 0.6 }}
            />
          </Pressable>

          {/* Icono Menú */}
          <Pressable onPress={toggleMenu}>
            <Image
              source={
                Platform.OS === "web" && menuVisible
                  ? require("../assets/iconos/close-organizador.png")
                  : require("../assets/iconos/menu-usuario.png")
              }
              style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
            />
          </Pressable>
        </View>
      </View>

      {/* === MENÚ === */}
      {Platform.OS === "web" ? (
        <>
          {menuVisible && (
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
          )}
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
            {["Perfil", "Sobre nosotros", "Cultura e Historia", "Contacto"].map(
              (item, i) => (
                <Pressable
                  key={i}
                  onPress={() => simulateNavigation(item)}
                  style={{ marginBottom: 25 }}
                >
                  <Text
                    style={{
                      color: "#014869",
                      fontSize: 18,
                      fontWeight: "700",
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              )
            )}
          </Animated.View>
        </>
      ) : (
        menuVisible && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#f8f8f8",
              zIndex: 20,
              paddingHorizontal: 24,
              paddingTop: 60,
            }}
          >
            {/* Encabezado menú móvil */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 30,
              }}
            >
              <Pressable onPress={toggleMenu} style={{ marginRight: 15 }}>
                <Image
                  source={require("../assets/iconos/back-usuario.png")}
                  style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
                />
              </Pressable>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#F3B23F",
                  textAlign: "center",
                  flex: 1,
                }}
              >
                Menú
              </Text>
            </View>

            {/* Opciones menú móvil */}
            <View style={{ flex: 1 }}>
              {[
                {
                  label: "Sobre nosotros",
                  icon: require("../assets/iconos/info-usuario.png"),
                },
                {
                  label: "Cultura e Historia",
                  icon: require("../assets/iconos/museo-usuario.png"),
                },
                {
                  label: "Contacto",
                  icon: require("../assets/iconos/phone-usuario.png"),
                },
              ].map((item, i) => (
                <Pressable
                  key={i}
                  onPress={() => simulateNavigation(item.label)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 25,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={item.icon}
                      style={{
                        width: 24,
                        height: 24,
                        tintColor: "#014869",
                        marginRight: 14,
                      }}
                    />
                    <Text
                      style={{
                        color: "#014869",
                        fontSize: 16,
                        fontWeight: "600",
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <Image
                    source={require("../assets/iconos/siguiente.png")}
                    style={{ width: 18, height: 18, tintColor: "#F3B23F" }}
                  />
                </Pressable>
              ))}
            </View>

            {/* Barra inferior móvil */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: "#F3B23F33",
                paddingVertical: 14,
              }}
            >
              <Image
                source={require("../assets/iconos/search.png")}
                style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
              />
              <Image
                source={require("../assets/iconos/calendar.png")}
                style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
              />
              <Image
                source={require("../assets/iconos/user.png")}
                style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
              />
            </View>
          </View>
        )
      )}

      {/* === LISTA DE NOTIFICACIONES === */}
      <ScrollView
        style={{ flex: 1, padding: 24 }}
        contentContainerStyle={{ alignItems: "center" }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#014869",
            marginBottom: 20,
          }}
        >
          Notificaciones
        </Text>

        {notifications.length === 0 ? (
          <Text style={{ color: "#777" }}>No tienes notificaciones aún.</Text>
        ) : (
          notifications.map((n) => (
            <Pressable
              key={n._id}
              onPress={() => markAsRead(n._id)}
              style={{
                backgroundColor: n.read ? "#9bbad0" : "#014869",
                paddingVertical: 12,
                borderRadius: 25,
                marginBottom: 12,
                alignItems: "center",
                width: "80%",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {n.message}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      {Platform.OS === "web" && <Footer />}
    </View>
  );
}
