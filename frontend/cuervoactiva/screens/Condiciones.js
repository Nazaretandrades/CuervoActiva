// frontend/src/screens/Condiciones.js
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

export default function Condiciones({ navigation }) {
  const [role, setRole] = useState("user");
  const [userName, setUserName] = useState("Usuario");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  /** === Obtener sesión === */
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

  /** === Navegaciones comunes === */
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

  /** === Alternar menú lateral === */
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

  /** === CABECERA USUARIO NORMAL === */
  const renderUserTopBar = () => (
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

      {/* Iconos derecha */}
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

  /** === CABECERA ADMIN IGUAL A CONTACTO === */
  const renderAdminTopBar = () => (
    <View style={styles.topBar}>
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

  /** === CABECERA ORGANIZADOR IGUAL A CULTURAHISTORIA === */
  const renderOrganizerTopBar = () =>
    role === "organizer" && (
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

  /** === MENÚ ADMIN IGUAL A CONTACTO === */
  const renderAdminMenu = () =>
    Platform.OS === "web" &&
    menuVisible && (
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

  /** === MENÚ ORGANIZADOR IGUAL A CONTACTO === */
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

  /** === MENÚ USUARIO WEB === */
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

  /** === CONTENIDO === */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {role === "admin"
        ? renderAdminTopBar()
        : role === "organizer"
        ? renderOrganizerTopBar()
        : renderUserTopBar()}

      {role === "admin"
        ? renderAdminMenu()
        : role === "organizer"
        ? renderOrganizerMenuWeb()
        : renderUserMenuWeb()}

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
          Condiciones de Uso
        </Text>

        <View
          style={{
            flexDirection: Platform.OS === "web" ? "row" : "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            width: "100%",
            maxWidth: 1000,
            backgroundColor: "#f2f2f2",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              width: Platform.OS === "web" ? "45%" : "90%",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 18,
                color: "#014869",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Términos Generales
            </Text>
            <Text style={{ color: "#333", lineHeight: 20, textAlign: "justify" }}>
              El uso de la aplicación Cuervo Activa implica la aceptación plena
              de los presentes términos y condiciones. Los usuarios se
              comprometen a utilizar la plataforma de manera responsable, sin
              realizar acciones que perjudiquen su funcionamiento o la
              experiencia de otros usuarios.
              {"\n\n"}
              Queda prohibido publicar contenido ofensivo, fraudulento, violento
              o que infrinja derechos de autor o privacidad. Cuervo Activa se
              reserva el derecho de eliminar cualquier contenido inapropiado y
              suspender cuentas que vulneren estas normas.
              {"\n\n"}
              El acceso a ciertos servicios puede requerir registro previo y la
              veracidad de la información proporcionada es responsabilidad del
              usuario.
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
              width: Platform.OS === "web" ? "45%" : "90%",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 18,
                color: "#014869",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Responsabilidad y Uso
            </Text>
            <Text style={{ color: "#333", lineHeight: 20, textAlign: "justify" }}>
              Cuervo Activa no se hace responsable del mal uso de la aplicación
              ni de los daños derivados del incumplimiento de las normas por
              parte del usuario. Las actividades y eventos publicados son
              responsabilidad de sus respectivos organizadores.
              {"\n\n"}
              El usuario acepta que su participación en actividades es
              voluntaria y que deberá revisar los detalles, condiciones y
              requisitos de cada evento antes de asistir.
              {"\n\n"}
              La plataforma podrá suspender temporalmente el servicio por
              mantenimiento o mejoras, notificando a los usuarios cuando sea
              posible.
            </Text>
          </View>
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

// === ESTILOS ===
const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
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
});
