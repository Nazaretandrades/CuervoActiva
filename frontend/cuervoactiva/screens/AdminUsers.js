// frontend/src/screens/AdminUsers.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Platform,
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

  // === TOAST (diseño igual al del Login) ===
  const [toast, setToast] = useState({ visible: false, type: "", message: "" });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() =>
        setToast({ visible: false, type: "", message: "" })
      );
    }, 3000);
  };

  // === MODAL DE CONFIRMACIÓN ===
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const openConfirmModal = (userId) => {
    setUserToDelete(userId);
    setConfirmVisible(true);
  };

  const closeConfirmModal = () => {
    setUserToDelete(null);
    setConfirmVisible(false);
  };

  // === OBTENER SESIÓN ===
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

  // === CARGAR USUARIOS ===
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

      if (!res.ok) throw new Error("Error al cargar los usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      showToast("error", "⚠️ No se pudieron cargar los usuarios");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // === NAVEGACIONES ===
  const goToProfile = () => navigation.navigate("AdminProfile");
  const goToNotifications = () => navigation.navigate("AdminNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");

  // === ELIMINAR USUARIO ===
  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const session = await getSession();
      const token = session?.token;

      const res = await fetch(`${API_URL}/${userToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar usuario");
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete));
      closeConfirmModal();
      showToast("success", "🗑️ Usuario eliminado correctamente");
    } catch (err) {
      closeConfirmModal();
      showToast("error", "❌ Error al eliminar el usuario");
    }
  };

  // === MENÚ LATERAL ===
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

      {/* === MODAL PERSONALIZADO DE CONFIRMACIÓN === */}
      {confirmVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 200,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 25,
              borderRadius: 15,
              width: 320,
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.25,
              shadowRadius: 6,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#014869",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              ¿Seguro que deseas eliminar este usuario?
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "80%",
              }}
            >
              <Pressable
                onPress={closeConfirmModal}
                style={{
                  backgroundColor: "#ccc",
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#333", fontWeight: "bold" }}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleDelete}
                style={{
                  backgroundColor: "#e74c3c",
                  paddingVertical: 8,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ marginRight: 6 }}>👑</Text>
          <Text>Admin. {adminName}</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={goToCalendar} style={{ marginRight: 6 }}>
            <Image
              source={require("../assets/iconos/calendar-admin.png")}
              style={{ width: 26, height: 26 }}
            />
          </Pressable>

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

      {/* === MENÚ LATERAL WEB === */}
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
              { label: "Ver usuarios", route: "AdminUsers" },
              { label: "Contacto", action: goToContact },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  toggleMenu();
                  if (item.action) item.action();
                  else if (item.route) navigation.navigate(item.route);
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
          paddingBottom: 100,
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
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>{u.name}</Text>

              <Pressable onPress={() => openConfirmModal(u._id)}>
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

      {/* === TOAST (DISEÑO IGUAL AL LOGIN) === */}
      {toast.visible && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 40,
            left: "5%",
            right: "5%",
            backgroundColor:
              toast.type === "success" ? "#4CAF50" : "#E74C3C",
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
            opacity: fadeAnim,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              textAlign: "center",
              fontSize: 15,
            }}
          >
            {toast.message}
          </Text>
        </Animated.View>
      )}

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
