import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  Alert,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";
const API_URL = `${API_BASE}/api/users`;

export default function AdminUsers() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [adminName, setAdminName] = useState("Admin");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // === Obtener sesión ===
  const getSession = async () => {
    try {
      if (Platform.OS === "web") {
        return JSON.parse(localStorage.getItem("USER_SESSION"));
      } else {
        const sessionString = await AsyncStorage.getItem("USER_SESSION");
        return sessionString ? JSON.parse(sessionString) : null;
      }
    } catch {
      return null;
    }
  };

  // === Cargar usuarios ===
  const loadUsers = async () => {
    try {
      const session = await getSession();
      const token = session?.token;
      if (session?.name) setAdminName(session.name);

      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // === Redirección a notificaciones ===
  const goToNotifications = () => {
    navigation.navigate("AdminNotifications");
  };

  // === Eliminar usuario ===
  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Seguro que deseas eliminar este usuario?");
    if (!confirm) return;

    try {
      const session = await getSession();
      const token = session?.token;

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar usuario");
      setUsers((prev) => prev.filter((u) => u._id !== id));
      Alert.alert("✅", "Usuario eliminado correctamente");
    } catch (err) {
      Alert.alert("Error", err.message);
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* === BARRA SUPERIOR === */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        {/* 👑 Admin */}
        <Text>
          👑 Admin. {adminName}
        </Text>

        {/* 🔔 Notificaciones y ☰ Menú */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={goToNotifications} style={{ marginRight: 6 }}>
            <Image
              source={require("../assets/iconos/bell2.png")}
              style={{ width: 24, height: 24 }}
            />
          </Pressable>

          <Pressable onPress={toggleMenu}>
            <Image
              source={
                menuVisible
                  ? require("../assets/iconos/close-admin.png")
                  : require("../assets/iconos/menu-admin.png")
              }
              style={{ width: 26, height: 26 }}
            />
          </Pressable>
        </View>
      </View>

      {/* === MENÚ WEB === */}
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
              { label: "Perfil" },
              { label: "Sobre nosotros" },
              { label: "Cultura e Historia" },
              { label: "Ver usuarios", route: "AdminUsers" },
              { label: "Contacto" },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  toggleMenu();
                  if (item.route) navigation.navigate(item.route);
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

      {/* === LISTADO DE USUARIOS === */}
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#014869",
            marginBottom: 20,
          }}
        >
          Usuarios
        </Text>

        {users.length > 0 ? (
          users.map((u) => (
            <View
              key={u._id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "60%",
                backgroundColor: "#014869",
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 30,
                marginBottom: 15,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {u.name}
              </Text>

              <Pressable onPress={() => handleDelete(u._id)}>
                <Image
                  source={require("../assets/iconos/papelera.png")}
                  style={{ width: 22, height: 22, tintColor: "#fff" }}
                />
              </Pressable>
            </View>
          ))
        ) : (
          <Text style={{ color: "#777", marginTop: 40 }}>
            No hay usuarios registrados.
          </Text>
        )}
      </ScrollView>

      {Platform.OS === "web" && <Footer />}
    </View>
  );
}
