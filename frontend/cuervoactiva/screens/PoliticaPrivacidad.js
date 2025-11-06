// frontend/src/screens/PoliticaPrivacidad.js
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

export default function PoliticaPrivacidad({ navigation }) {
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
  const goToUsers = () => navigation.navigate("AdminUsers");
  const goToContact = () => navigation.navigate("Contacto");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToAbout = () => navigation.navigate("SobreNosotros");

  /** === Menú lateral animado === */
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

  /** === Barra superior según rol === */
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ marginRight: 6 }}>👑</Text>
            <Text>Admin. {userName}</Text>
          </View>

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
            zIndex: 1,
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

    let menuItems = [];
    if (role === "admin") {
      menuItems = [
        { label: "Perfil", action: goToProfile },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        { label: "Ver usuarios", action: goToUsers },
        { label: "Contacto", action: goToContact },
      ];
    } else if (role === "organizer") {
      menuItems = [
        { label: "Perfil", action: goToProfile },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        { label: "Contacto", action: goToContact },
      ];
    } else {
      // usuario normal
      menuItems = [
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
          {menuItems.map((item, i) => (
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
    <View style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}>
      <Header hideAuthButtons />

      {renderTopBar()}
      {renderMenu()}

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
          Política y Privacidad
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
              Política
            </Text>
            <Text style={{ color: "#333", lineHeight: 20, textAlign: "justify" }}>
              Cuervo Activa se compromete a garantizar un uso responsable de la
              aplicación y el respeto entre los usuarios. Todos los contenidos,
              eventos y publicaciones deben promover la convivencia y cumplir con la
              normativa vigente. Cualquier uso indebido, ofensivo o que vulnere los
              derechos de terceros será motivo de suspensión o eliminación del acceso
              a la plataforma.
              {"\n\n"}
              La aplicación puede modificar sus políticas en cualquier momento para
              mejorar la experiencia o adaptarse a nuevas regulaciones, notificando
              los cambios a través de la misma.
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
              Privacidad
            </Text>
            <Text style={{ color: "#333", lineHeight: 20, textAlign: "justify" }}>
              En Cuervo Activa, la protección de tus datos personales es una
              prioridad. Solo se recogen los datos estrictamente necesarios
              (nombre, correo electrónico, rol y participación en eventos) para
              ofrecer un servicio personalizado.
              {"\n\n"}
              Cumplimos con la normativa europea de protección de datos (RGPD) y
              garantizamos que la información no será compartida con terceros sin tu
              consentimiento, salvo requerimiento legal. Puedes ejercer tus derechos
              de acceso, modificación o eliminación escribiendo a{" "}
              <Text style={{ color: "#014869", fontWeight: "bold" }}>
                cuervoactivasoporte@gmail.com
              </Text>
              .
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
