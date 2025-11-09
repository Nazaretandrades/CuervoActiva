// frontend/src/screens/SobreNosotros.js
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

  /** === Cargar sesión === */
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

  /** === Navegaciones === */
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

  /** === Menú lateral web === */
  const toggleMenu = () => {
    if (Platform.OS !== "web") {
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

  /** === Cabecera superior (idéntica a Calendar.js, con corona/lápiz) === */
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

    // 👑 Admin tiene corona — 🖋️ Organizer tiene lápiz — Usuario no tiene nada
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
        {/* Perfil */}
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
            {/* Solo muestra la insignia si es admin u organizer */}
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

        {/* Iconos derecha */}
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
                  ? require("../assets/iconos/close-organizador.png")
                  : require("../assets/iconos/menu-organizador.png")
              }
              style={{ width: 24, height: 24, tintColor: tint }}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  /** === Menú lateral web === */
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

  /** === CONTENIDO === */
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

      {/* === Menú móvil (igual que en Contacto) === */}
      {Platform.OS !== "web" && menuVisible && (
        role === "organizer" ? (
          <OrganizerMenu onClose={toggleMenu} />
        ) : (
          <UserMenu onClose={toggleMenu} />
        )
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          alignItems: "center",
          backgroundColor: "#f9f9f9",
          flexGrow: 1,
          paddingBottom: 120,
          marginTop: 60,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#014869",
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          Sobre Nosotros
        </Text>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 20,
            maxWidth: 900,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 3,
          }}
        >
          <Text
            style={{
              color: "#333",
              lineHeight: 22,
              textAlign: "justify",
              fontSize: 16,
            }}
          >
            {content}
          </Text>
        </View>
      </ScrollView>

      {Platform.OS === "web" && (
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

/** === ESTILOS === */
const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    justifyContent: "space-between",
    backgroundColor: "#fff",
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
