// Pantalla de las condiciones
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Platform,
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Se declara el componente
export default function Condiciones({ navigation }) {
  const { width, height } = useWindowDimensions();
  // Breakpoints
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 900;
  const isLaptop = width >= 900 && width < 1400;
  const isDesktop = width >= 1400;
  const dynamicPadding = isMobile ? 14 : isTablet ? 18 : 24;
  const cardMinHeight = isMobile ? 260 : isTablet ? 320 : 350;
  // Estados
  const [role, setRole] = useState("user");
  const [userName, setUserName] = useState("Usuario");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // Carga la sesión
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

  // Navegaciones según el rol
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
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToAbout = () => navigation.navigate("SobreNosotros");

  // Menu
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

  // Tamaño de los textos
  const textSizeTitle = isMobile ? 12 : 14;
  const textSizeName = isMobile ? 12 : 13;
  const iconSize = isMobile ? 20 : 22;
  const menuIconSize = isMobile ? 22 : 24;

  // Cabecera Usuario
  const renderUserTopBar = () => (
    <View style={[styles.topBar, { paddingHorizontal: dynamicPadding }]}>
      <View style={styles.profileContainer}>
        <View style={styles.profileCircleUser}>
          <Image
            source={require("../assets/iconos/user.png")}
            style={{ width: iconSize, height: iconSize, tintColor: "#fff" }}
          />
        </View>

        <View>
          <Text
            style={{
              color: "#014869",
              fontWeight: "700",
              fontSize: textSizeTitle,
            }}
          >
            Usuario
          </Text>
          <Text style={{ color: "#6c757d", fontSize: textSizeName }}>
            {userName}
          </Text>
        </View>
      </View>

      <View style={styles.iconRow}>
        <Pressable onPress={goToNotifications} style={styles.iconButton}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: iconSize, height: iconSize, tintColor: "#014869" }}
          />
        </Pressable>

        {Platform.OS === "web" && (
          <Pressable onPress={goToCalendar} style={styles.iconButton}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={{
                width: iconSize,
                height: iconSize,
                tintColor: "#014869",
              }}
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
            style={{
              width: menuIconSize,
              height: menuIconSize,
              tintColor: "#014869",
            }}
          />
        </Pressable>
      </View>
    </View>
  );

  // Cabecera Administrador
  const renderAdminTopBar = () => (
    <View style={[styles.topBar, { paddingHorizontal: dynamicPadding }]}>
      <View style={styles.adminInfo}>
        <View style={styles.adminIconContainer}>
          <Image
            source={require("../assets/iconos/user.png")}
            style={[styles.userIcon, { width: iconSize, height: iconSize }]}
          />
          <Image
            source={require("../assets/iconos/corona.png")}
            style={[styles.crownIcon, { width: iconSize, height: iconSize }]}
          />
        </View>

        <View>
          <Text style={[styles.adminTitle, { fontSize: textSizeTitle }]}>
            Admin.
          </Text>
          <Text style={[styles.adminName, { fontSize: textSizeName }]}>
            {userName}
          </Text>
        </View>
      </View>

      <View style={styles.iconRow}>
        <Pressable onPress={goToNotifications} style={styles.iconButton}>
          <Image
            source={require("../assets/iconos/bell2.png")}
            style={{ width: iconSize, height: iconSize, tintColor: "#0094A2" }}
          />
        </Pressable>

        <Pressable onPress={goToCalendar} style={styles.iconButton}>
          <Image
            source={require("../assets/iconos/calendar-admin.png")}
            style={{ width: iconSize, height: iconSize, tintColor: "#0094A2" }}
          />
        </Pressable>

        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close-admin.png")
                : require("../assets/iconos/menu-admin.png")
            }
            style={{
              width: menuIconSize,
              height: menuIconSize,
              tintColor: "#0094A2",
            }}
          />
        </Pressable>
      </View>
    </View>
  );

  // Cabecera Organizador
  const renderOrganizerTopBar = () =>
    role === "organizer" && (
      <View style={[styles.topBar, { paddingHorizontal: dynamicPadding }]}>
        <View style={styles.profileContainer}>
          <View style={styles.profileCircleOrganizer}>
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: iconSize, height: iconSize, tintColor: "#fff" }}
            />
            <Image
              source={require("../assets/iconos/lapiz.png")}
              style={[
                styles.penIcon,
                { width: iconSize, height: iconSize, top: -5, left: -5 },
              ]}
            />
          </View>

          <View>
            <Text
              style={{
                color: "#014869",
                fontWeight: "700",
                fontSize: textSizeTitle,
              }}
            >
              Organiz.
            </Text>
            <Text style={{ color: "#6c757d", fontSize: textSizeName }}>
              {userName}
            </Text>
          </View>
        </View>

        <View style={styles.iconRow}>
          <Pressable onPress={goToNotifications} style={styles.iconButton}>
            <Image
              source={require("../assets/iconos/bell3.png")}
              style={{
                width: iconSize,
                height: iconSize,
                tintColor: "#F3B23F",
              }}
            />
          </Pressable>

          {Platform.OS === "web" && (
            <Pressable onPress={goToCalendar} style={styles.iconButton}>
              <Image
                source={require("../assets/iconos/calendar-organizador.png")}
                style={{
                  width: iconSize,
                  height: iconSize,
                  tintColor: "#F3B23F",
                }}
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
              style={{
                width: menuIconSize,
                height: menuIconSize,
                tintColor: "#F3B23F",
              }}
            />
          </Pressable>
        </View>
      </View>
    );

  // UI
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/**Cabecera según el rol */}
      {role === "admin"
        ? renderAdminTopBar()
        : role === "organizer"
        ? renderOrganizerTopBar()
        : renderUserTopBar()}

      {/* Menu lateral */}
      {Platform.OS === "web" && menuVisible && (
        <Animated.View
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: isMobile ? 200 : 250,
            height: "100%",
            backgroundColor: "#f8f8f8",
            padding: isMobile ? 14 : 20,
            zIndex: 10,
            transform: [{ translateX: menuAnim }],
            boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          }}
        >
          {[
            { label: "Perfil", action: goToProfile },
            role === "admin" && {
              label: "Ver usuarios",
              action: () => navigation.navigate("AdminUsers"),
            },
            {
              label: "Cultura e Historia",
              action: () => navigation.navigate("CulturaHistoria"),
            },
            role === "user" && {
              label: "Ver favoritos",
              action: () => navigation.navigate("UserFavorites"),
            },
            {
              label: "Contacto",
              action: () => navigation.navigate("Contacto"),
            },
          ]
            .filter(Boolean)
            .map((item, i) => (
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
                    fontSize: isMobile ? 16 : 18,
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

      {/* Scroll principal */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: dynamicPadding,
          alignItems: "center",
          backgroundColor: "#f9f9f9",
          flexGrow: 1,
          marginTop: isTablet ? -10 : isMobile ? 0 : 60,
          paddingBottom: isMobile ? 20 : isTablet ? 80 : 160,
        }}
      >
        <Text
          style={{
            fontSize: isMobile ? 20 : 22,
            fontWeight: "bold",
            color: "#014869",
            textAlign: "center",
            marginTop: isTablet ? 1 : isMobile ? 10 : 0,
            marginBottom: isTablet ? 1 : isMobile ? 20 : 0,
          }}
        >
          Condiciones de Uso
        </Text>
        {/* Contenedor principal */}
        <View
          style={{
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "center",
            alignItems: "stretch",
            gap: isMobile ? 20 : 24,
            width: "100%",
            maxWidth: 1100,
            backgroundColor: "#f2f2f2",
            borderRadius: 12,
            padding: isMobile ? 12 : 20,
            height: isMobile ? height * 0.65 : "auto",
            overflow: "visible",
          }}
        >
          {/* Card 1 */}
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
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: isMobile ? 16 : 18,
                  color: "#014869",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                Términos Generales
              </Text>

              <Text
                style={{
                  color: "#333",
                  lineHeight: isMobile ? 18 : 20,
                  textAlign: "justify",
                  fontSize: isMobile ? 13 : 14,
                  maxWidth: "100%",
                }}
              >
                {`El uso de la aplicación Cuervo Activa implica la aceptación plena
de los presentes términos y condiciones. Los usuarios se
comprometen a utilizar la plataforma de manera responsable, sin
realizar acciones que perjudiquen su funcionamiento o la
experiencia de otros usuarios.

Queda prohibido publicar contenido ofensivo, fraudulento, violento
o que infrinja derechos de autor o privacidad. Cuervo Activa se
reserva el derecho de eliminar cualquier contenido inapropiado y
suspender cuentas que vulneren estas normas.

El acceso a ciertos servicios puede requerir registro previo y la
veracidad de la información proporcionada es responsabilidad del
usuario.`}
              </Text>
            </ScrollView>
          </View>

          {/* Card 2 */}
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
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: isMobile ? 16 : 18,
                  color: "#014869",
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                Responsabilidad y Uso
              </Text>

              <Text
                style={{
                  color: "#333",
                  lineHeight: isMobile ? 18 : 20,
                  textAlign: "justify",
                  fontSize: isMobile ? 13 : 14,
                  maxWidth: "100%",
                }}
              >
                {`Cuervo Activa no se hace responsable del mal uso de la aplicación
ni de los daños derivados del incumplimiento de las normas por
parte del usuario. Las actividades y eventos publicados son
responsabilidad de sus respectivos organizadores.

El usuario acepta que su participación en actividades es
voluntaria y que deberá revisar los detalles, condiciones y
requisitos de cada evento antes de asistir.

La plataforma podrá suspender temporalmente el servicio por
mantenimiento o mejoras, notificando a los usuarios cuando sea
posible.`}
              </Text>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {Platform.OS === "web" && !isMobile && !isTablet && (
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
          {/**Footer */}
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

// Estilos
const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    justifyContent: "space-between",
    backgroundColor: "#fff",
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
  penIcon: {
    position: "absolute",
    top: -4,
    left: -4,
    width: 22,
    height: 22,
    resizeMode: "contain",
    transform: [{ rotate: "-25deg" }],
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
  adminTitle: { color: "#014869", fontWeight: "700" },
  adminName: { color: "#6c757d" },
  iconRow: { flexDirection: "row", alignItems: "center" },
  iconButton: { marginRight: 16 },
});
