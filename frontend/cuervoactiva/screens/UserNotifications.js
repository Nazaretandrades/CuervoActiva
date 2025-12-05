// Pantalla notificaciones de los usuarios
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Animated,
  Image,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

// Api según la plataforma
const API_BASE =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

// Declarar el componente
export default function UserNotifications({ navigation }) {
  // Estados
  const [userName, setUserName] = useState("Usuario");
  const [notifications, setNotifications] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  /* Responsive */
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

  // Breakpoints
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

  /* Toast*/
  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "info" });
    }, 2500);
  };
  /* Cargar Usuario */
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
        setUserName("Usuario");
      }
    };
    loadUser();
  }, []);

  /* Cargar notificaciones */
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
          setNotifications(await res.json());
        } else {
          showToast("❌ Error al cargar notificaciones.", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("⚠️ No se pudieron obtener las notificaciones.", "error");
      }
    };
    loadNotifications();
  }, []);

  /* Marcar como leído */
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

      if (!res.ok) throw new Error("Error al eliminar");

      setNotifications((prev) => prev.filter((n) => n._id !== id));

      showToast("✅ Notificación marcada como leída.", "success");
    } catch {
      showToast("❌ Error al marcar la notificación.", "error");
    }
  };

  /* Navegaciones */
  const goToProfile = () => navigation.navigate("UserProfile");
  const goToNotifications = () => navigation.navigate("UserNotifications");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToContact = () => navigation.navigate("Contacto");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToHome = () => navigation.navigate("User");

  /* Menú */
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

  /* Cabecera */
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
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            position: "relative",
            marginRight: 12,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#014869",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/iconos/user.png")}
            style={{ width: 24, height: 24, tintColor: "#fff" }}
          />
        </View>
        <View>
          <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
            Usuario
          </Text>
          <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: 22, height: 22, tintColor: "#014869" }}
          />
        </Pressable>

        {isWeb && (
          <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={{ width: 22, height: 22, tintColor: "#014869" }}
            />
          </Pressable>
        )}

        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close.png")
                : require("../assets/iconos/menu-usuario.png")
            }
            style={{ width: 24, height: 24, tintColor: "#014869" }}
          />
        </Pressable>
      </View>
    </View>
  );
  /* Render */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}>
      <Header hideAuthButtons />
      {renderTopBar()}

      {/* Menú web */}
      {isWeb && menuVisible && (
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
            {
              label: "Ver favoritos",
              action: () => navigation.navigate("UserFavorites"),
            },
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
      )}

      {/* Contenido */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: pagePaddingHorizontal,
          paddingTop: 10,
          paddingBottom: pagePaddingBottom,
          backgroundColor: "#f5f6f7",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 20,
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
                  width: Platform.OS === "web" ? "100%" : "100%",
                  alignSelf: "center",
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

      {/* Menú móvil nativo */}
      {menuVisible && !isWeb && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#f4f6f7",
            zIndex: 20,
            paddingHorizontal: 24,
            paddingTop: 50,
          }}
        >
          {/* Móvil Header */}
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
                style={{ width: 22, height: 22, tintColor: "#014869" }}
              />
            </Pressable>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#014869",
                textAlign: "center",
                flex: 1,
                marginRight: 37,
              }}
            >
              Menú
            </Text>
          </View>

          {/* Opciones móvil */}
          <View style={{ flex: 1 }}>
            {[
              {
                label: "Cultura e Historia",
                icon: require("../assets/iconos/museo-usuario.png"),
                action: goToCulturaHistoria,
              },
              {
                label: "Sobre nosotros",
                icon: require("../assets/iconos/info-usuario.png"),
                action: goToAboutUs,
              },
              {
                label: "Ver favoritos",
                icon: require("../assets/iconos/favs-usuario.png"),
                action: () => navigation.navigate("UserFavorites"),
              },
              {
                label: "Contacto",
                icon: require("../assets/iconos/phone-usuario.png"),
                action: goToContact,
              },
            ].map((item, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  toggleMenu();
                  item.action();
                }}
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
                      width: 22,
                      height: 22,
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
                  style={{
                    width: 18,
                    height: 18,
                    tintColor: "#014869",
                  }}
                />
              </Pressable>
            ))}
          </View>

          {/* Bottom móvil */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              borderTopWidth: 2,
              borderTopColor: "#01486999",
              paddingVertical: 14,
              backgroundColor: "#fff",
            }}
          >
            <Pressable onPress={goToHome}>
              <Image
                source={require("../assets/iconos/home-usuario.png")}
                style={{ width: 24, height: 24, tintColor: "#014869" }}
              />
            </Pressable>

            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar.png")}
                style={{ width: 24, height: 24, tintColor: "#014869" }}
              />
            </Pressable>

            <Pressable onPress={goToProfile}>
              <Image
                source={require("../assets/iconos/user.png")}
                style={{ width: 24, height: 24, tintColor: "#014869" }}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* Footer */}
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
