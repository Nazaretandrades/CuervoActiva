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
  useWindowDimensions,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PoliticaPrivacidad({ navigation }) {
  const [role, setRole] = useState("user");
  const [userName, setUserName] = useState("Usuario");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  const { width, height } = useWindowDimensions();

  // 🔹 Breakpoints como en Condiciones
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
  const goToUsers = () => navigation.navigate("AdminUsers");
  const goToContact = () => navigation.navigate("Contacto");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToAbout = () => navigation.navigate("SobreNosotros");

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

  // -----------------------
  // TOPBARS
  // -----------------------

  const renderUserTopBar = () => (
    <View style={[styles.topBar, { paddingHorizontal: dynamicPadding }]}>
      <View style={styles.profileContainer}>
        <View style={styles.profileCircleUser}>
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

      <View style={styles.iconRow}>
        <Pressable onPress={goToNotifications} style={styles.iconButton}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: 22, height: 22, tintColor: "#014869" }}
          />
        </Pressable>

        {Platform.OS === "web" && (
          <Pressable onPress={goToCalendar} style={styles.iconButton}>
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

  const renderAdminTopBar = () => (
    <View style={[styles.topBar, { paddingHorizontal: dynamicPadding }]}>
      <View style={styles.adminInfo}>
        <View style={styles.adminIconContainer}>
          <Image
            source={require("../assets/iconos/user.png")}
            style={styles.userIcon}
          />
          <Image
            source={require("../assets/iconos/corona.png")}
            style={styles.crownIcon}
          />
        </View>

        <View>
          <Text style={styles.adminTitle}>Admin.</Text>
          <Text style={styles.adminName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.iconRow}>
        <Pressable onPress={goToNotifications} style={styles.iconButton}>
          <Image
            source={require("../assets/iconos/bell2.png")}
            style={styles.topIcon}
          />
        </Pressable>
        <Pressable onPress={goToCalendar} style={styles.iconButton}>
          <Image
            source={require("../assets/iconos/calendar-admin.png")}
            style={styles.topIcon}
          />
        </Pressable>
        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close-admin.png")
                : require("../assets/iconos/menu-admin.png")
            }
            style={styles.topIcon}
          />
        </Pressable>
      </View>
    </View>
  );

  const renderOrganizerTopBar = () =>
    role === "organizer" && (
      <View style={[styles.topBar, { paddingHorizontal: dynamicPadding }]}>
        <View style={styles.profileContainer}>
          <View style={styles.profileCircleOrganizer}>
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 24, height: 24, tintColor: "#fff" }}
            />
            <Image
              source={require("../assets/iconos/lapiz.png")}
              style={{
                position: "absolute",
                top: -4,
                left: -4,
                width: 22,
                height: 22,
                resizeMode: "contain",
                transform: [{ rotate: "-25deg" }],
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

        <View style={styles.iconRow}>
          <Pressable onPress={goToNotifications} style={styles.iconButton}>
            <Image
              source={require("../assets/iconos/bell3.png")}
              style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
            />
          </Pressable>

          {Platform.OS === "web" && (
            <Pressable onPress={goToCalendar} style={styles.iconButton}>
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

  // -----------------------
  // MENÚS WEB
  // -----------------------

  const renderAdminMenu = () =>
    Platform.OS === "web" &&
    menuVisible &&
    role === "admin" && (
      <>
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}
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
              <Text style={styles.menuItem}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </>
    );

  const renderOrganizerMenuWeb = () =>
    role === "organizer" &&
    Platform.OS === "web" &&
    menuVisible && (
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
    );

  const renderUserMenuWeb = () =>
    role === "user" &&
    Platform.OS === "web" &&
    menuVisible && (
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
    );

  // -----------------------
  // CONTENIDO PRINCIPAL (RESPONSIVE COMO CONDICIONES)
  // -----------------------

  const renderMainContent = () => (
    <>
      <Text
        style={{
          fontSize: isMobile ? 20 : 22,
          fontWeight: "bold",
          color: "#014869",
          textAlign: "center",
          width: "100%",
          marginBottom: 30,
        }}
      >
        Política y Privacidad
      </Text>

      <View
        style={{
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "center",
          alignItems: "stretch",
          width: "100%",
          maxWidth: 1100,
          backgroundColor: "#f2f2f2",
          borderRadius: 12,
          padding: isMobile ? 12 : 20,
          gap: isMobile ? 20 : 24,
          alignSelf: "center",
          height: isMobile ? height * 0.65 : "auto",
          overflow: "visible",
        }}
      >
        {/* CARD POLÍTICA */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: isMobile ? 16 : 20,
            flex: 1,
            minHeight: cardMinHeight,
            maxHeight: isMobile ? height * 0.65 : "none",
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
            <Text style={styles.cardTitle}>Política</Text>
            <Text style={styles.cardText}>
              Cuervo Activa se compromete a garantizar un uso responsable de la
              aplicación y el respeto entre los usuarios. Todos los contenidos,
              eventos y publicaciones deben promover la convivencia y cumplir
              con la normativa vigente. Cualquier uso indebido, ofensivo o que
              vulnere los derechos de terceros será motivo de suspensión o
              eliminación del acceso a la plataforma.
              {"\n\n"}
              La aplicación puede modificar sus políticas en cualquier momento
              para mejorar la experiencia o adaptarse a nuevas regulaciones,
              notificando los cambios a través de la misma.
            </Text>
          </ScrollView>
        </View>

        {/* CARD PRIVACIDAD */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: isMobile ? 16 : 20,
            flex: 1,
            minHeight: cardMinHeight,
            maxHeight: isMobile ? height * 0.65 : "none",
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
            <Text style={styles.cardTitle}>Privacidad</Text>
            <Text style={styles.cardText}>
              En Cuervo Activa, la protección de tus datos personales es una
              prioridad. Solo se recogen los datos estrictamente necesarios
              (nombre, correo electrónico, rol y participación en eventos) para
              ofrecer un servicio personalizado.
              {"\n\n"}
              Cumplimos con la normativa europea de protección de datos (RGPD) y
              garantizamos que la información no será compartida con terceros
              sin tu consentimiento, salvo requerimiento legal. Puedes ejercer
              tus derechos de acceso, modificación o eliminación escribiendo a{" "}
              <Text style={{ color: "#014869", fontWeight: "bold" }}>
                cuervoactivasoporte@gmail.com
              </Text>
              .
            </Text>
          </ScrollView>
        </View>
      </View>
    </>
  );

  // -----------------------
  // RETURN
  // -----------------------

  return (
    <View
      style={{
        backgroundColor: "#fff",
        minHeight: Platform.OS === "web" && isMobile ? "auto" : "100%",
        flex: 1,
      }}
    >
      <Header hideAuthButtons />

      {/* TOP BAR */}
      {role === "admin"
        ? renderAdminTopBar()
        : role === "organizer"
        ? renderOrganizerTopBar()
        : renderUserTopBar()}

      {/* MENÚS WEB */}
      {renderAdminMenu()}
      {renderOrganizerMenuWeb()}
      {renderUserMenuWeb()}

      {/* SCROLL PRINCIPAL (MISMA IDEA QUE CONDICIONES) */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{
          padding: dynamicPadding,
          alignItems: "center",
          backgroundColor: "#f9f9f9",
          flexGrow: 1,
          marginTop: isMobile ? 0 : isTablet ? 40 : 60,
          paddingBottom: isMobile ? 20 : isTablet ? 40 : 160,
        }}
      >
        {renderMainContent()}
      </ScrollView>

      {/* FOOTER SOLO EN WEB ESCRITORIO (NO MOBILE, NO TABLET) */}
      {Platform.OS === "web" && !isMobile && !isTablet && (
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
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  adminInfo: { flexDirection: "row", alignItems: "center" },
  adminIconContainer: {
    position: "relative",
    marginRight: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0094A2",
    alignItems: "center",
    justifyContent: "center",
  },
  userIcon: { width: 24, height: 24, tintColor: "#fff" },
  crownIcon: {
    position: "absolute",
    top: -12,
    left: -6,
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  adminTitle: { color: "#014869", fontWeight: "700", fontSize: 14 },
  adminName: { color: "#6c757d", fontSize: 13 },
  iconRow: { flexDirection: "row", alignItems: "center" },
  iconButton: { marginRight: 20 },
  topIcon: { width: 22, height: 22, tintColor: "#0094A2" },

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

  profileContainer: { flexDirection: "row", alignItems: "center" },
  profileCircleUser: {
    position: "relative",
    marginRight: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#014869",
    alignItems: "center",
    justifyContent: "center",
  },
  profileCircleOrganizer: {
    position: "relative",
    marginRight: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3B23F",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#014869",
    marginBottom: 10,
    textAlign: "center",
  },
  cardText: {
    color: "#333",
    lineHeight: 20,
    textAlign: "justify",
  },
});
