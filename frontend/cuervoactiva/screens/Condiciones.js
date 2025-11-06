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
    if (Platform.OS !== "web") return;
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

  /** === Cabecera superior === */
  const renderTopBar = () => {
    // === ADMIN ===
    if (Platform.OS === "web" && role === "admin") {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderBottomWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text>👑 Admin. {userName}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar-admin.png")}
                style={{ width: 26, height: 26 }}
              />
            </Pressable>
            <Pressable onPress={goToNotifications}>
              <Image
                source={require("../assets/iconos/bell2.png")}
                style={{ width: 24, height: 24 }}
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

    // === ORGANIZADOR ===
    if (Platform.OS === "web" && role === "organizer") {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text style={{ fontWeight: "600", color: "#014869" }}>
            👤 {userName}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar-organizador.png")}
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>
            <Pressable onPress={goToNotifications}>
              <Image
                source={require("../assets/iconos/bell.png")}
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>
            <Pressable onPress={toggleMenu}>
              <Image
                source={
                  menuVisible
                    ? require("../assets/iconos/close-organizador.png")
                    : require("../assets/iconos/menu-usuario.png")
                }
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>
          </View>
        </View>
      );
    }

    // === USUARIO NORMAL ===
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <Text style={{ fontWeight: "600", color: "#014869" }}>
          👤 {userName}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          {/* CALENDARIO */}
          <Pressable onPress={goToCalendar}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={{ width: 26, height: 26, tintColor: "#014869" }}
            />
          </Pressable>

          {/* NOTIFICACIONES */}
          <Pressable onPress={goToNotifications}>
            <Image
              source={require("../assets/iconos/bell.png")}
              style={{ width: 26, height: 26, tintColor: "#014869" }}
            />
          </Pressable>

          {/* MENÚ */}
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

  /** === Menú lateral === */
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
        { label: "Ver favoritos", action: () => navigation.navigate("UserFavorites") },
        { label: "Contacto", action: goToContact },
      ];
    }

    return (
      <>
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 9,
            }}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 250,
            height: "100%",
            backgroundColor: "#f8f8f8",
            padding: 20,
            zIndex: 10,
            transform: [{ translateX: menuAnim }],
          }}
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
              <Text
                style={{
                  color: "#014869",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      </>
    );
  };

  /** === Render principal === */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {renderTopBar()}
      {renderMenu()}

      {/* === CONTENIDO PRINCIPAL === */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          alignItems: "center",
          backgroundColor: "#f9f9f9",
          flexGrow: 1,
          paddingBottom: 120,
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
