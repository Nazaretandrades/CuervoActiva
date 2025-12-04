import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Pressable,
  StyleSheet,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OrganizerMenu from "./OrganizerMenu";
import UserMenu from "./UserMenu";

export default function SobreNosotros({ navigation }) {
  const [role, setRole] = useState("user");
  const [userName, setUserName] = useState("Usuario");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // 🔹 Breakpoints / dimensiones (igual estilo que en Condiciones)
  const { width, height } = useWindowDimensions();
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 900;
  const isLaptop = width >= 900 && width < 1400;
  const isDesktop = width >= 1400;

  const dynamicPadding = isMobile ? 14 : isTablet ? 18 : 24;
  const cardMinHeight = isMobile ? 260 : isTablet ? 320 : 350;

  useEffect(() => {
    const loadSession = async () => {
      try {
        let session;
        if (Platform.OS === "web") {
          session = JSON.parse(localStorage.getItem("USER_SESSION"));
        } else {
          const sessionString = await AsyncStorage.getItem("USER_SESSION");
          session = sessionString ? JSON.parse(sessionString) : null;
        }

        if (session?.user?.name) setUserName(session.user.name);
        else if (session?.name) setUserName(session.name);

        if (session?.user?.role) setRole(session.user.role);
        else if (session?.role) setRole(session.role);
        else setRole("user");
      } catch (err) {
        console.error("Error obteniendo sesión:", err);
      }
    };
    loadSession();
  }, []);

  const goToProfile = () =>
    role === "admin"
      ? navigation.navigate("AdminProfile")
      : role === "organizer"
      ? navigation.navigate("OrganizerProfile")
      : navigation.navigate("UserProfile");
  const goToNotifications = () =>
    role === "admin"
      ? navigation.navigate("AdminNotifications")
      : role === "organizer"
      ? navigation.navigate("OrganizerNotifications")
      : navigation.navigate("UserNotifications");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToContact = () => navigation.navigate("Contacto");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToFavorites = () => navigation.navigate("UserFavorites");
  const goToAbout = () => navigation.navigate("SobreNosotros");
  const goToUsers = () => navigation.navigate("AdminUsers");

  const toggleMenu = () => {
    if (Platform.OS !== "web") {
      setMenuVisible(!menuVisible);
      return;
    }

    // 🔥 FIX WEB: useNativeDriver debe ser false
    if (menuVisible) {
      Animated.timing(menuAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const renderTopBar = () => {
    const tint =
      role === "organizer"
        ? "#F3B23F"
        : role === "admin"
        ? "#0094A2"
        : "#014869";
    const avatarBg = tint;

    const bellIcon =
      role === "organizer"
        ? require("../assets/iconos/bell3.png")
        : role === "admin"
        ? require("../assets/iconos/bell2.png")
        : require("../assets/iconos/bell.png");

    const calIcon =
      role === "organizer"
        ? require("../assets/iconos/calendar-organizador.png")
        : role === "admin"
        ? require("../assets/iconos/calendar-admin.png")
        : require("../assets/iconos/calendar.png");

    const userBadge =
      role === "admin"
        ? require("../assets/iconos/corona.png")
        : role === "organizer"
        ? require("../assets/iconos/lapiz.png")
        : null;

    const userBadgeStyle =
      role === "admin"
        ? {
            position: "absolute",
            top: -10,
            left: -4,
            width: 22,
            height: 22,
            resizeMode: "contain",
            transform: [{ rotate: "-15deg" }],
          }
        : {
            position: "absolute",
            top: -6,
            left: -6,
            width: 20,
            height: 20,
            resizeMode: "contain",
            transform: [{ rotate: "-20deg" }],
          };

    return (
      <View style={styles.topBar}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              position: "relative",
              marginRight: 12,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: avatarBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 24, height: 24, tintColor: "#fff" }}
            />
            {userBadge && <Image source={userBadge} style={userBadgeStyle} />}
          </View>
          <View>
            <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
              {role === "admin"
                ? "Admin."
                : role === "organizer"
                ? "Organiz."
                : "Usuario"}
            </Text>
            <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
            <Image
              source={bellIcon}
              style={{ width: 22, height: 22, tintColor: tint }}
            />
          </Pressable>

          {Platform.OS === "web" && (
            <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
              <Image
                source={calIcon}
                style={{ width: 22, height: 22, tintColor: tint }}
              />
            </Pressable>
          )}

          <Pressable onPress={toggleMenu}>
            <Image
              source={
                menuVisible
                  ? role === "admin"
                    ? require("../assets/iconos/close-admin.png")
                    : role === "organizer"
                    ? require("../assets/iconos/close-organizador.png")
                    : require("../assets/iconos/close.png")
                  : role === "admin"
                  ? require("../assets/iconos/menu-admin.png")
                  : role === "organizer"
                  ? require("../assets/iconos/menu-organizador.png")
                  : require("../assets/iconos/menu-usuario.png")
              }
              style={{ width: 24, height: 24, tintColor: tint }}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  const renderMenu = () => {
    if (!menuVisible || Platform.OS !== "web") return null;

    let items = [];
    if (role === "admin") {
      items = [
        { label: "Perfil", action: goToProfile },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        { label: "Ver usuarios", action: goToUsers },
        { label: "Contacto", action: goToContact },
      ];
    } else if (role === "organizer") {
      items = [
        { label: "Perfil", action: goToProfile },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        { label: "Contacto", action: goToContact },
      ];
    } else {
      items = [
        { label: "Perfil", action: goToProfile },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        { label: "Ver favoritos", action: goToFavorites },
        { label: "Contacto", action: goToContact },
      ];
    }

    return (
      <>
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}
        >
          {items.map((item, i) => (
            <Pressable
              key={i}
              onPress={() => {
                toggleMenu();
                item.action();
              }}
              style={{ marginBottom: 25 }}
            >
              <Text style={styles.menuItem}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </>
    );
  };

  const content = `Cuervo Activa es una aplicación multiplataforma creada para fomentar la participación ciudadana y la difusión cultural en el municipio de El Cuervo de Sevilla.
Su objetivo principal es ofrecer un espacio digital donde los vecinos puedan descubrir, promover y participar en los distintos eventos, actividades y celebraciones locales de una forma sencilla, rápida y accesible.

La aplicación permite que tanto los organizadores como el propio Ayuntamiento gestionen eventos de carácter deportivo, cultural, social o educativo, centralizando toda la información en una única herramienta.
Por su parte, los usuarios pueden consultar el calendario de actividades, añadir eventos a sus favoritos, recibir notificaciones y mantenerse al día sobre todo lo que ocurre en su localidad.

Cuervo Activa busca modernizar la comunicación entre la administración y la ciudadanía, impulsando la vida social y el sentido de comunidad mediante la tecnología.`;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {renderTopBar()}
      {renderMenu()}

      {Platform.OS !== "web" &&
        menuVisible &&
        (role === "organizer" ? (
          <OrganizerMenu onClose={toggleMenu} />
        ) : (
          <UserMenu onClose={toggleMenu} />
        ))}

      {/* 🔥 AJUSTE DE BACKGROUND SUBIDO EN LAPTOP Y ESCRITORIO */}
      <ImageBackground
        source={require("../assets/logo.png")}
        resizeMode="contain"
        imageStyle={{
          opacity: 0.3,
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        style={{
          flex: 1,
          marginTop: isLaptop ? -40 : isDesktop ? -60 : 0,
          zIndex: 0, // <-- AÑADIR
          position: "relative", // <-- AÑADIR
        }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: dynamicPadding,
            alignItems: "center",
            flexGrow: 1,

            marginTop: isTablet ? 20 : isMobile ? 30 : 60,
            paddingBottom: isMobile ? 30 : isTablet ? 220 : 160,
          }}
        >
          <Text
            style={{
              fontSize: isMobile ? 20 : 22,
              fontWeight: "bold",
              color: "#014869",
              textAlign: "center",
              marginBottom: isMobile ? 20 : 24,
            }}
          >
            Sobre Nosotros
          </Text>

          <View
            style={{
              backgroundColor: "#fcfcfcff",
              borderRadius: 16,
              padding: isMobile ? 16 : 20,
              width: "100%",
              maxWidth: 900,
              minHeight: cardMinHeight,
              maxHeight: isMobile
                ? height * 0.65
                : isTablet
                ? height * 0.6
                : "none",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
              overflow: "hidden",
            }}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={{
                  color: "#333",
                  lineHeight: isMobile ? 20 : 22,
                  textAlign: "justify",
                  fontSize: isMobile ? 13 : 14,
                }}
              >
                {content}
              </Text>
            </ScrollView>
          </View>
        </ScrollView>
      </ImageBackground>

      {Platform.OS === "web" && width >= 1024 && (
        <View
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: "#fff",
          }}
        >
          <Footer
            onAboutPress={goToAbout}
            onPrivacyPress={goToPrivacy}
            onConditionsPress={goToConditions}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    justifyContent: "space-between",
    backgroundColor: "#fff",

    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },

  sideMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 250,
    height: "100%",
    backgroundColor: "#f8f8f8",
    padding: 20,
    zIndex: 10,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 9,
  },
  menuItem: { color: "#014869", fontSize: 18, fontWeight: "700" },
});
