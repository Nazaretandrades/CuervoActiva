import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Platform,
  StyleSheet,
  Animated,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function CulturaHistoria() {
  const [role, setRole] = useState("user");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [userName, setUserName] = useState("Usuario");

  const nav = useNavigation();

  useEffect(() => {
    const loadSession = async () => {
      try {
        let session;
        if (Platform.OS === "web") {
          session = JSON.parse(localStorage.getItem("USER_SESSION"));
        } else {
          const s = await AsyncStorage.getItem("USER_SESSION");
          session = s ? JSON.parse(s) : null;
        }
        if (session?.user?.role) setRole(session.user.role);
        else if (session?.role) setRole(session.role);
        if (session?.name) setUserName(session.name);
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };
    loadSession();
  }, []);

  // === Funciones de navegación ===
  const goToProfile = () =>
    role === "admin"
      ? nav.navigate("AdminProfile")
      : role === "organizer"
      ? nav.navigate("OrganizerProfile")
      : nav.navigate("UserProfile");
  const goToNotifications = () =>
    role === "admin"
      ? nav.navigate("AdminNotifications")
      : role === "organizer"
      ? nav.navigate("OrganizerNotifications")
      : nav.navigate("UserNotifications");
  const goToAboutUs = () => nav.navigate("SobreNosotros");
  const goToPrivacy = () => nav.navigate("PoliticaPrivacidad");
  const goToConditions = () => nav.navigate("Condiciones");
  const goToContact = () => nav.navigate("Contacto");
  const goToCulturaHistoria = () => nav.navigate("CulturaHistoria");
  const goToCalendar = () => nav.navigate("Calendar");
  const goToUsers = () => nav.navigate("AdminUsers");
  const goToHome = () =>
    role === "organizer"
      ? nav.navigate("Organizer")
      : role === "admin"
      ? nav.navigate("Admin")
      : nav.navigate("User");
  const goToFavorites = () => nav.navigate("UserFavorites");

  // === Animación del menú ===
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

  // === Barra superior ===
  const renderTopBar = () => {
    let color = "#014869";
    let calendarIcon = require("../assets/iconos/calendar.png");
    let bellIcon = require("../assets/iconos/bell.png");
    let menuIcon = require("../assets/iconos/menu-usuario.png");
    let closeIcon = require("../assets/iconos/close.png");

    if (role === "organizer") {
      color = "#F3B23F";
      calendarIcon = require("../assets/iconos/calendar-organizador.png");
      bellIcon = require("../assets/iconos/bell3.png");
      menuIcon = require("../assets/iconos/menu-organizador.png");
      closeIcon = require("../assets/iconos/close-organizador.png");
    } else if (role === "admin") {
      color = "#33ADB5";
      calendarIcon = require("../assets/iconos/calendar-admin.png");
      bellIcon = require("../assets/iconos/bell2.png");
      menuIcon = require("../assets/iconos/menu-admin.png");
      closeIcon = require("../assets/iconos/close-admin.png");
    }

    return (
      <View style={styles.topBar}>
        <Text>
          {role === "admin"
            ? `👑 Admin. ${userName}`
            : role === "organizer"
            ? `👤  ${userName}`
            : `👤 ${userName}`}
        </Text>

        <View style={styles.topBarIcons}>
          <Pressable onPress={goToCalendar}>
            <Image
              source={calendarIcon}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          </Pressable>

          <Pressable onPress={goToNotifications}>
            <Image
              source={bellIcon}
              style={{
                width: 24,
                height: 24,
                marginHorizontal: 10,
                tintColor: color,
              }}
            />
          </Pressable>

          <Pressable onPress={toggleMenu}>
            <Image
              source={menuVisible ? closeIcon : menuIcon}
              style={{ width: 26, height: 26, tintColor: color }}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  // === Menú lateral WEB ===
  const renderWebMenu = () => {
    if (!menuVisible || Platform.OS !== "web") return null;

    const items =
      role === "admin"
        ? [
            { label: "Perfil", action: goToProfile },
            { label: "Cultura e Historia", action: goToCulturaHistoria },
            { label: "Ver usuarios", action: goToUsers },
            { label: "Contacto", action: goToContact },
          ]
        : [
            { label: "Perfil", action: goToProfile },
            { label: "Cultura e Historia", action: goToCulturaHistoria },
            { label: "Contacto", action: goToContact },
          ];

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

  // === Menú móvil azul (user) ===
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
              action: goToAboutUs,
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
          ].map((item, index) => (
            <Pressable
              key={index}
              onPress={item.action}
              style={styles.optionBlue}
            >
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

  // === Menú móvil naranja (organizer) ===
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
          <Pressable style={styles.option} onPress={goToAboutUs}>
            <View style={styles.optionLeft}>
              <Image
                source={require("../assets/iconos/info-usuario.png")}
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Sobre nosotros</Text>
            </View>
            <Image
              source={require("../assets/iconos/siguiente.png")}
              style={styles.arrowIcon}
            />
          </Pressable>

          <Pressable style={styles.option} onPress={goToCulturaHistoria}>
            <View style={styles.optionLeft}>
              <Image
                source={require("../assets/iconos/museo-usuario.png")}
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Cultura e Historia</Text>
            </View>
            <Image
              source={require("../assets/iconos/siguiente.png")}
              style={styles.arrowIcon}
            />
          </Pressable>

          <Pressable style={styles.option} onPress={goToContact}>
            <View style={styles.optionLeft}>
              <Image
                source={require("../assets/iconos/phone-usuario.png")}
                style={styles.optionIcon}
              />
              <Text style={styles.optionText}>Contacto</Text>
            </View>
            <Image
              source={require("../assets/iconos/siguiente.png")}
              style={styles.arrowIcon}
            />
          </Pressable>
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

  // === Render principal ===
  return (
    <View style={styles.pageContainer}>
      <Header hideAuthButtons />
      {renderTopBar()}
      {renderWebMenu()}
      {Platform.OS !== "web" && role === "user" && renderMobileMenuUser()}
      {Platform.OS !== "web" &&
        role === "organizer" &&
        renderMobileMenuOrganizer()}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 20,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator
        nestedScrollEnabled
      >
        <Text style={styles.title}>Cultura e Historia</Text>
        <Text style={styles.paragraph}>
          El Cuervo de Sevilla, situado en la comarca del Bajo Guadalquivir, fue
          parte de Lebrija hasta finales del siglo XX. Su independencia se
          alcanzó el 19 de diciembre de 1992 tras un movimiento popular.{" "}
          {"\n\n"}
          Sus orígenes modernos se remontan al siglo XVIII, gracias a su
          ubicación junto a la antigua calzada romana Vía Augusta —hoy la N-4—,
          donde existía una Casa de Postas que servía de punto de descanso entre
          Cádiz y Sevilla.
        </Text>

        {events.map((evt, i) => (
          <View key={i} style={styles.eventCard}>
            <Image source={evt.image} style={styles.eventImage} />
            <View style={styles.eventTextContainer}>
              <Text style={styles.eventTitle}>{evt.title}</Text>
              <Text style={styles.eventText}>{evt.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

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

// === Eventos ===
const events = [
  {
    title: "Feria del Cuervo",
    image: require("../assets/feria.jpg"),
    description:
      "Celebradas en honor a la Virgen del Rosario, patrona del municipio, durante la primera semana de octubre. Es la fiesta más esperada por los vecinos, llena de alegría, música, baile y tradición.",
  },
  {
    title: "Semana Santa de El Cuervo",
    image: require("../assets/semana_santa.jpg"),
    description:
      "La Semana Santa se caracteriza por su recogimiento, la participación de hermandades locales y el fervor popular en sus procesiones.",
  },
  {
    title: "Romería de El Cuervo",
    image: require("../assets/romeria.jpg"),
    description:
      "La Romería es una jornada de convivencia, devoción y tradición andaluza, donde los vecinos acompañan a su Virgen en un ambiente festivo y familiar.",
  },
  {
    title: "Día del Pan",
    image: require("../assets/dia_pan.jpg"),
    description:
      "Celebración gastronómica que homenajea el oficio tradicional de panadero, con degustaciones, actividades y talleres para toda la familia.",
  },
];


// === Estilos ===
const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
    minHeight: "100vh",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  topBarIcons: { flexDirection: "row", alignItems: "center" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#014869",
    textAlign: "center",
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "justify",
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  eventImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 10,
  },
  eventTextContainer: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: "bold", color: "#014869" },
  eventText: { fontSize: 14, color: "#444", marginTop: 4 },
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
  headerTitleBlue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#014869",
  },
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
    backgroundColor: "#fff",
  },
  bottomIcon: { width: 26, height: 26, tintColor: "#F3B23F" },
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
  menuItem: { color: "#014869", fontSize: 18, fontWeight: "700" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 9,
  },
});
