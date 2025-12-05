// Pantalla de notificaciones del Administrador
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  TouchableWithoutFeedback,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

// URL dinámica para backend (Render en producción, local en desarrollo)
const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://192.168.18.19:5000"); 

// Endpoint de notificaciones
const API_BASE = BACKEND_URL;


// Se declara el componente
export default function AdminNotifications({ navigation }) {
  // Estados
  const [adminName, setAdminName] = useState("Admin");
  const [notifications, setNotifications] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  /* Breakpoints */
  const [winWidth, setWinWidth] = useState(
    Platform.OS === "web" ? window.innerWidth : Dimensions.get("window").width
  );
  // Función para redimensionar en tiempo real
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const resize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const isWeb = Platform.OS === "web";
  const isMobileWeb = isWeb && winWidth < 768;
  const isTabletWeb = isWeb && winWidth >= 768 && winWidth < 1024;
  const isLaptopWeb = isWeb && winWidth >= 1024 && winWidth < 1440;
  const isDesktopWeb = isWeb && winWidth >= 1440;
  const isLargeWeb = isLaptopWeb || isDesktopWeb;
  const pagePaddingHorizontal = isMobileWeb
    ? 20
    : isTabletWeb
    ? 40
    : isLaptopWeb
    ? 55
    : 80;
  const pagePaddingBottom = isLargeWeb ? 80 : 20;
  const notificationsContainerWidth = isMobileWeb
    ? "100%"
    : isTabletWeb
    ? "95%"
    : isLaptopWeb
    ? "85%"
    : "70%";

  /* Función para mostrar el toast */
  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "info" }),
      2500
    );
  };

  /* Cargar administrador */
  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem("USER_SESSION"));
      if (session?.user?.name || session?.name)
        setAdminName(session.user?.name || session.name);
    } catch {
      setAdminName("Admin");
    }
  }, []);

  /* Cargar notificaciones */
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
          showToast("❌ Error al cargar notificaciones.", "error");
        }
      } catch (err) {
        showToast("⚠️ No se pudieron obtener las notificaciones.", "error");
      }
    };
    loadNotifications();
  }, []);

  /* Marcar como leído las notificaciones */
  const markAsRead = async (id) => {
    try {
      const session = JSON.parse(localStorage.getItem("USER_SESSION"));
      const token = session?.token;

      const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      setNotifications((prev) => prev.filter((n) => n._id !== id));

      showToast("✅ Notificación marcada como leída correctamente.", "success");
    } catch {
      showToast("❌ No se pudo marcar la notificación.", "error");
    }
  };

  /* Navegación */
  const goToProfile = () => navigation.navigate("AdminProfile");
  const goToNotifications = () => navigation.navigate("AdminNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToUsers = () => navigation.navigate("AdminUsers");

  /* Menú */
  const toggleMenu = () => {
    if (!isWeb) {
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

  // UI
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}>
      <Header hideAuthButtons />

      {/* Cabecera) */}
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
                top: -6,
                left: -6,
                width: 20,
                height: 20,
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

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={goToNotifications} style={{ marginRight: 20 }}>
            <Image
              source={require("../assets/iconos/bell2.png")}
              style={{ width: 22, height: 22, tintColor: "#0094A2" }}
            />
          </Pressable>
          <Pressable onPress={goToCalendar} style={{ marginRight: 20 }}>
            <Image
              source={require("../assets/iconos/calendar-admin.png")}
              style={{ width: 22, height: 22, tintColor: "#0094A2" }}
            />
          </Pressable>
          <Pressable onPress={toggleMenu}>
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

      {/* Menú lateral web */}
      {isWeb && menuVisible && (
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
              boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
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
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </>
      )}

      {/* Contenido */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: pagePaddingHorizontal,
          paddingTop: 20,
          paddingBottom: pagePaddingBottom,
          backgroundColor: "#f5f6f7",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#014869",
            marginBottom: 20,
            textAlign: "center",
            width: notificationsContainerWidth,
          }}
        >
          Notificaciones
        </Text>

        <ScrollView
          style={{
            flex: 1,
            maxHeight: isWeb ? "65vh" : 500,
            width: notificationsContainerWidth,
          }}
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: 30,
          }}
        >
          {notifications.length === 0 ? (
            <Text style={{ color: "#777" }}>No hay notificaciones aún.</Text>
          ) : (
            notifications.map((n) => (
              <Pressable
                key={n._id}
                onPress={() => markAsRead(n._id)}
                style={{
                  backgroundColor: "#014869",
                  paddingVertical: 12,
                  borderRadius: 25,
                  marginBottom: 12,
                  alignItems: "center",
                  width: "100%",
                  cursor: "pointer",
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
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

      {/* Footer responsive en web */}
      {isWeb && isLargeWeb && (
        <View
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            zIndex: 100,
          }}
        >
          <Footer
            onAboutPress={goToAboutUs}
            onPrivacyPress={goToPrivacy}
            onConditionsPress={goToConditions}
          />
        </View>
      )}

      {/* Toast */}
      {toast.visible && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 100,
            alignSelf: "center",
            backgroundColor:
              toast.type === "success"
                ? "#4BB543"
                : toast.type === "error"
                ? "#D9534F"
                : "#014869",
            paddingVertical: 12,
            paddingHorizontal: 25,
            borderRadius: 25,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
