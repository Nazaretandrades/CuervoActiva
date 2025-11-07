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
    role === "organizer"
      ? navigation.navigate("OrganizerProfile")
      : navigation.navigate("UserProfile");
  const goToNotifications = () =>
    role === "organizer"
      ? navigation.navigate("OrganizerNotifications")
      : navigation.navigate("UserNotifications");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToContact = () => navigation.navigate("Contacto");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToFavorites = () => navigation.navigate("UserFavorites");
  const goToHome = () =>
    role === "organizer"
      ? navigation.navigate("Organizer")
      : navigation.navigate("User");

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

  /** === Barra superior === */
  const renderTopBar = () => {
    if (role === "admin") {
      return (
        <View style={styles.topBar}>
          <Text>👑 Admin. {userName}</Text>
          <View style={styles.topBarIcons}>
            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar-admin.png")}
                style={{ width: 26, height: 26, marginRight: 10 }}
              />
            </Pressable>

            <Pressable onPress={goToNotifications}>
              <Image
                source={require("../assets/iconos/bell2.png")}
                style={{ width: 24, height: 24, marginRight: 10 }}
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
      );
    }

    if (role === "organizer") {
      return (
        <View style={styles.topBar}>
          <Text style={{ color: "#014869" }}>👤 {userName}</Text>
          <View style={styles.topBarIcons}>
            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar-organizador.png")}
                style={{
                  width: 26,
                  height: 26,
                  tintColor: "#F3B23F",
                  marginRight: 10,
                }}
              />
            </Pressable>

            <Pressable onPress={goToNotifications}>
              <Image
                source={require("../assets/iconos/bell3.png")}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: "#F3B23F",
                  marginRight: 10,
                }}
              />
            </Pressable>

            <Pressable onPress={toggleMenu}>
              <Image
                source={
                  menuVisible
                    ? require("../assets/iconos/close-organizador.png")
                    : require("../assets/iconos/menu-organizador.png")
                }
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>
          </View>
        </View>
      );
    }

    // === USUARIO ===
    return (
      <View style={styles.topBar}>
        <Text>👤 {userName}</Text>
        <View style={styles.topBarIcons}>
          <Pressable onPress={goToCalendar}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={{
                width: 26,
                height: 26,
                tintColor: "#014869",
                marginRight: 10,
              }}
            />
          </Pressable>

          <Pressable onPress={goToNotifications}>
            <Image
              source={require("../assets/iconos/bell.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: "#014869",
                marginRight: 10,
              }}
            />
          </Pressable>

          <Pressable onPress={toggleMenu}>
            <Image
              source={
                menuVisible
                  ? require("../assets/iconos/close.png")
                  : require("../assets/iconos/menu-usuario.png")
              }
              style={{ width: 26, height: 26, tintColor: "#014869" }}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  /** === Menú web === */
  const renderWebMenu = () => {
    if (!menuVisible || Platform.OS !== "web") return null;

    let items = [];

    if (role === "admin") {
      items = [
        { label: "Perfil", action: goToProfile },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        {
          label: "Ver usuarios",
          action: () => navigation.navigate("AdminUsers"),
        },
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

  /** === Menú móvil azul (user) === */
  const renderMobileMenuUser = () =>
    menuVisible &&
    role === "user" && (
      <View style={styles.mobileMenuContainer}>
        <View style={styles.headerBlue}>
          <Pressable onPress={toggleMenu}>
            <Image
              source={require("../assets/iconos/back-usuario.png")}
              style={styles.backIconBlue}
            />
          </Pressable>
          <Text style={styles.headerTitleBlue}>Menú</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.menuOptionsBlue}>
          {[
            {
              label: "Cultura e Historia",
              icon: require("../assets/iconos/museo-usuario.png"),
              action: goToCulturaHistoria,
            },
            {
              label: "Sobre nosotros",
              icon: require("../assets/iconos/info-usuario.png"),
              action: () => {},
            },
            {
              label: "Ver favoritos",
              icon: require("../assets/iconos/favs-usuario.png"),
              action: goToFavorites,
            },
            {
              label: "Contacto",
              icon: require("../assets/iconos/phone-usuario.png"),
              action: goToContact,
            },
          ].map((item, i) => (
            <Pressable key={i} onPress={item.action} style={styles.optionBlue}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={item.icon} style={styles.optionIconBlue} />
                <Text style={styles.optionTextBlue}>{item.label}</Text>
              </View>
              <Image
                source={require("../assets/iconos/siguiente.png")}
                style={styles.arrowIconBlue}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomBarBlue}>
          <Pressable onPress={goToHome}>
            <Image
              source={require("../assets/iconos/home-usuario.png")}
              style={styles.bottomIconBlue}
            />
          </Pressable>
          <Pressable onPress={goToCalendar}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={styles.bottomIconBlue}
            />
          </Pressable>
          <Pressable onPress={goToProfile}>
            <Image
              source={require("../assets/iconos/user.png")}
              style={styles.bottomIconBlue}
            />
          </Pressable>
        </View>
      </View>
    );

  /** === Menú móvil naranja (organizer) === */
  const renderMobileMenuOrganizer = () =>
    menuVisible &&
    role === "organizer" && (
      <View style={styles.mobileMenuContainer}>
        <View style={styles.header}>
          <Pressable onPress={toggleMenu}>
            <Image
              source={require("../assets/iconos/back-organizador.png")}
              style={styles.backIcon}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Menú</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.menuOptions}>
          {[
            {
              label: "Sobre nosotros",
              icon: require("../assets/iconos/info-usuario.png"),
              action: () => {},
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
            <Pressable key={i} onPress={item.action} style={styles.option}>
              <View style={styles.optionLeft}>
                <Image source={item.icon} style={styles.optionIcon} />
                <Text style={styles.optionText}>{item.label}</Text>
              </View>
              <Image
                source={require("../assets/iconos/siguiente.png")}
                style={styles.arrowIcon}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomBar}>
          <Pressable onPress={goToHome}>
            <Image
              source={require("../assets/iconos/home-organizador.png")}
              style={styles.bottomIcon}
            />
          </Pressable>
          <Pressable onPress={goToCalendar}>
            <Image
              source={require("../assets/iconos/calendar-organizador.png")}
              style={styles.bottomIcon}
            />
          </Pressable>
          <Pressable onPress={goToProfile}>
            <Image
              source={require("../assets/iconos/user.png")}
              style={styles.bottomIcon}
            />
          </Pressable>
        </View>
      </View>
    );

  /** === Texto principal === */
  const content = `Cuervo Activa es una aplicación multiplataforma creada para fomentar la participación ciudadana y la difusión cultural en el municipio de El Cuervo de Sevilla.
Su objetivo principal es ofrecer un espacio digital donde los vecinos puedan descubrir, promover y participar en los distintos eventos, actividades y celebraciones locales de una forma sencilla, rápida y accesible.

La aplicación permite que tanto los organizadores como el propio Ayuntamiento gestionen eventos de carácter deportivo, cultural, social o educativo, centralizando toda la información en una única herramienta.
Por su parte, los usuarios pueden consultar el calendario de actividades, añadir eventos a sus favoritos, recibir notificaciones y mantenerse al día sobre todo lo que ocurre en su localidad.

Cuervo Activa busca modernizar la comunicación entre la administración y la ciudadanía, impulsando la vida social y el sentido de comunidad mediante la tecnología.`;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {renderTopBar()}
      {renderWebMenu()}
      {Platform.OS !== "web" && role === "user" && renderMobileMenuUser()}
      {Platform.OS !== "web" &&
        role === "organizer" &&
        renderMobileMenuOrganizer()}

      {/* === Contenido === */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 30, paddingVertical: 20 }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 20,
            color: "#014869",
          }}
        >
          Sobre Nosotros
        </Text>
        <Text
          style={{
            textAlign: "justify",
            fontSize: 15,
            lineHeight: 22,
            color: "#333",
          }}
        >
          {content}
        </Text>
      </ScrollView>

      {Platform.OS === "web" && (
        <Footer
          onAboutPress={() => {}}
          onPrivacyPress={goToPrivacy}
          onConditionsPress={goToConditions}
        />
      )}
    </View>
  );
}

/** === Estilos === */
const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  topBarIcons: { flexDirection: "row", alignItems: "center" },
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

  // === Azul ===
  mobileMenuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 100,
  },
  headerBlue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitleBlue: { fontSize: 18, fontWeight: "bold", color: "#014869" },
  backIconBlue: { width: 22, height: 22, tintColor: "#014869" },
  menuOptionsBlue: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "flex-start",
    gap: 30,
  },
  optionBlue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionIconBlue: {
    width: 28,
    height: 28,
    tintColor: "#014869",
    marginRight: 12,
  },
  optionTextBlue: { color: "#014869", fontSize: 16, fontWeight: "600" },
  arrowIconBlue: { width: 16, height: 16, tintColor: "#014869" },
  bottomBarBlue: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#014869",
  },
  bottomIconBlue: { width: 26, height: 26, tintColor: "#014869" },

  // === Naranja ===
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#F3B23F" },
  backIcon: { width: 22, height: 22, tintColor: "#F3B23F" },
  menuOptions: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "flex-start",
    gap: 30,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  optionIcon: { width: 28, height: 28, tintColor: "#014869" },
  optionText: { color: "#014869", fontSize: 16, fontWeight: "600" },
  arrowIcon: { width: 16, height: 16, tintColor: "#F3B23F" },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#F3B23F",
  },
  bottomIcon: { width: 26, height: 26, tintColor: "#F3B23F" },
});
