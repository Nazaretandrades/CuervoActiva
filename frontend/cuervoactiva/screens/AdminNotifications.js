import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

const API_BASE = "http://localhost:5000";

export default function AdminNotifications({ navigation }) {
  const [adminName, setAdminName] = useState("Administrador");
  const [notifications, setNotifications] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // === Obtener usuario logueado ===
  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem("USER_SESSION"));
      if (session?.user?.name || session?.name)
        setAdminName(session.user?.name || session.name);
    } catch {
      setAdminName("Administrador");
    }
  }, []);

  // === Cargar notificaciones ===
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("USER_SESSION"));
        const token = session?.token;

        const res = await fetch(`${API_BASE}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        } else {
          console.error("❌ Error al cargar notificaciones del admin.");
        }
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
      }
    };
    loadNotifications();
  }, []);

  // === Marcar notificación como leída ===
  const markAsRead = async (id) => {
    try {
      const session = JSON.parse(localStorage.getItem("USER_SESSION"));
      const token = session?.token;

      const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al marcar como leída");

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );

      alert("✅ Notificación marcada como leída");
    } catch (err) {
      console.error("Error al marcar como leída:", err);
      alert("❌ Error al marcar como leída");
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

  const handleMenuOption = (option) => {
    toggleMenu();
    alert(`Iría a: ${option}`);
  };

  // === UI ===
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
        {/* 👑 Admin */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text>👑</Text>
          <Text style={{ fontWeight: "600", color: "#014869" }}>
            Admin: {adminName}
          </Text>
        </View>

        {/* 🔔 + Menú */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
          <Pressable>
            <Image
              source={require("../assets/iconos/bell2.png")}
              style={{ width: 26, height: 26, opacity: 0.6 }}
            />
          </Pressable>

          <Pressable onPress={toggleMenu}>
            <Image
              source={
                menuVisible
                  ? require("../assets/iconos/close-admin.png")
                  : require("../assets/iconos/menu-admin.png")
              }
              style={{ width: 26, height: 26, tintColor: "#33ADB5" }}
            />
          </Pressable>
        </View>
      </View>

      {/* === MENÚ LATERAL === */}
      {menuVisible && (
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
              "Perfil",
              "Sobre nosotros",
              "Cultura e Historia",
              "Ver usuarios",
              "Contacto",
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => handleMenuOption(item)}
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
            ))}
          </Animated.View>
        </>
      )}

      {/* === LISTA DE NOTIFICACIONES CON SCROLL === */}
      <View style={{ flex: 1, padding: 24 }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#014869",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Notificaciones
        </Text>

        <ScrollView
          style={{
            maxHeight: 500, // 👈 Limita la altura visible
            width: "100%",
          }}
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={true} // 👈 Scroll visible
        >
          {notifications.length === 0 ? (
            <Text style={{ color: "#777" }}>No hay notificaciones aún.</Text>
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
                  cursor: "pointer",
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
      </View>

      <Footer />
    </View>
  );
}
