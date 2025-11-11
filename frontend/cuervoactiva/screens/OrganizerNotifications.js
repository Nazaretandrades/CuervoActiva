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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
const API_BASE =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

export default function OrganizerNotifications({ navigation }) {
  const [userName, setUserName] = useState("Organizador");
  const [notifications, setNotifications] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  // Toast visual
  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "info" }),
      2500
    );
  };

  // Obtener usuario logueado
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

  // Cargar notificaciones
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
        } else {
          showToast("❌ Error al cargar notificaciones.", "error");
        }
      } catch (err) {
        console.error("Error al cargar notificaciones:", err);
        showToast("⚠️ No se pudieron obtener las notificaciones.", "error");
      }
    };
    loadNotifications();
  }, []);

  // Marcar como leída y eliminar
  const markAsRead = async (id) => {
    try {
      const session =
        Platform.OS === "web"
          ? JSON.parse(localStorage.getItem("USER_SESSION"))
          : JSON.parse(await AsyncStorage.getItem("USER_SESSION"));
      const token = session?.token;

      const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar notificación");

      setNotifications((prev) => prev.filter((n) => n._id !== id));

      showToast("✅ Notificación marcada como leída correctamente.", "success");
    } catch (err) {
      console.error("Error al marcar notificación como leída:", err);
      showToast("❌ No se pudo marcar la notificación.", "error");
    }
  };

  // Navegaciones
  const goToProfile = () => navigation.navigate("OrganizerProfile");
  const goToNotifications = () => navigation.navigate("OrganizerNotifications");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToContact = () => navigation.navigate("Contacto");
  const goToAbout = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToHomeOrganizador = () => navigation.navigate("Organizer");

  // Menú lateral / móvil
  const toggleMenu = () => {
    if (Platform.OS !== "web") {
      setMenuVisible((prev) => !prev);
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

  // CABECERA IGUAL A ORGANIZER
  const renderTopBar = () => (
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
      {/* Perfil organizador */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            position: "relative",
            marginRight: 12,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#F3B23F",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/iconos/user.png")}
            style={{ width: 24, height: 24, tintColor: "#fff" }}
          />
          <Image
            source={require("../assets/iconos/lapiz.png")}
            style={{
              position: "absolute",
              top: -6,
              left: -6,
              width: 20,
              height: 20,
              resizeMode: "contain",
              transform: [{ rotate: "-20deg" }],
            }}
          />
        </View>
        <View>
          <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
            Organiz.
          </Text>
          <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
        </View>
      </View>

      {/* Iconos derecha */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/bell3.png")}
            style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
          />
        </Pressable>

        {Platform.OS === "web" && (
          <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
            <Image
              source={require("../assets/iconos/calendar-organizador.png")}
              style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
            />
          </Pressable>
        )}

        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close-organizador.png")
                : require("../assets/iconos/menu-organizador.png")
            }
            style={{ width: 24, height: 24, tintColor: "#F3B23F" }}
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}>
      <Header hideAuthButtons />
      {renderTopBar()}

      {/* NUEVO MENÚ WEB */}
      {Platform.OS === "web" && menuVisible && (
        <>
          <Animated.View
            style={{
              position: "fixed",
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

      {/* CONTENIDO SCROLL CON FOOTER FIJO */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 10,
          paddingBottom: 0,
          backgroundColor: "#f5f6f7",
          overflow: "hidden",
        }}
      >
        <Text
          style={{
            fontSize: 20,
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
            flex: 1,
            maxHeight: Platform.OS === "web" ? "65vh" : 500,
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
                  width: "80%",
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

      {/* MENÚ MÓVIL */}
      {menuVisible && Platform.OS !== "web" && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fff",
            zIndex: 20,
            justifyContent: "space-between",
          }}
        >
          {/* CABECERA DEL MENÚ MÓVIL */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 50,
              paddingBottom: 20,
            }}
          >
            <Pressable onPress={toggleMenu}>
              <Image
                source={require("../assets/iconos/back-organizador.png")}
                style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
              />
            </Pressable>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: "#F3B23F" }}
            >
              Menú
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* OPCIONES DEL MENÚ MÓVIL */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: 40,
              justifyContent: "flex-start",
              gap: 30,
            }}
          >
            {[
              {
                label: "Sobre nosotros",
                icon: require("../assets/iconos/info-usuario.png"),
                action: goToAbout,
              },
              {
                label: "Cultura e Historia",
                icon: require("../assets/iconos/museo-usuario.png"),
                action: goToCulturaHistoria,
              },
              {
                label: "Contacto",
                icon: require("../assets/iconos/phone-usuario.png"),
                action: goToContact,
              },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  toggleMenu();
                  item.action();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={item.icon}
                    style={{
                      width: 28,
                      height: 28,
                      tintColor: "#014869",
                      marginRight: 12,
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
                  style={{ width: 16, height: 16, tintColor: "#F3B23F" }}
                />
              </Pressable>
            ))}
          </View>

          {/* FOOTER INFERIOR DEL MENÚ MÓVIL */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              paddingVertical: 10,
              borderTopWidth: 1,
              borderColor: "#F3B23F",
              backgroundColor: "#fff",
            }}
          >
            <Pressable
              onPress={() => {
                const currentRoute =
                  navigation.getState().routes.slice(-1)[0].name || "Organizer";
                if (currentRoute === "Organizer") {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Organizer" }],
                  });
                } else {
                  navigation.navigate("Organizer");
                }
              }}
            >
              <Image
                source={require("../assets/iconos/home-organizador.png")}
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>

            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar-organizador.png")}
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>

            <Pressable onPress={goToProfile}>
              <Image
                source={require("../assets/iconos/user.png")}
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* FOOTER FIJO */}
      {Platform.OS === "web" && (
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
            onAboutPress={goToAbout}
            onPrivacyPress={goToPrivacy}
            onConditionsPress={goToConditions}
          />
        </View>
      )}

      {/* TOAST */}
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
          <Text
            style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
          >
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
