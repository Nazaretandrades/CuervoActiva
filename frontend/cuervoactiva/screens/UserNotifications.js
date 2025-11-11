import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Animated,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

const API_BASE =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

export default function UserNotifications({ navigation }) {
  const [userName, setUserName] = useState("Usuario");
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
        setUserName("Usuario");
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

  // Marcar como leída (eliminar)
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
  const goToProfile = () => navigation.navigate("UserProfile");
  const goToNotifications = () => navigation.navigate("UserNotifications");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToContact = () => navigation.navigate("Contacto");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToHome = () => navigation.navigate("User");

  // Menú lateral
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

  // CABECERA
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
      {/* Perfil Usuario */}
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

      {/* Iconos */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: 22, height: 22, tintColor: "#014869" }}
          />
        </Pressable>

        {Platform.OS === "web" && (
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}>
      <Header hideAuthButtons />
      {renderTopBar()}

      {/* MENÚ WEB */}
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
        </>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 10,
          backgroundColor: "#f5f6f7",
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
            backgroundColor: "#f4f6f7",
            zIndex: 20,
            paddingHorizontal: 24,
            paddingTop: 50,
          }}
        >
          {/*Header */}
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

          {/*Opciones */}
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
                  style={{ width: 18, height: 18, tintColor: "#014869" }}
                />
              </Pressable>
            ))}
          </View>

          {/*Barra inferior */}
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
            onAboutPress={goToAboutUs}
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
