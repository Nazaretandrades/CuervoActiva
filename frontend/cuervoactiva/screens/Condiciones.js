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

  // === Obtener sesión ===
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

  // === Ir a notificaciones según rol ===
  const goToNotifications = () => {
    if (role === "admin") navigation.navigate("AdminNotifications");
    else if (role === "organizer") navigation.navigate("OrganizerNotifications");
    else navigation.navigate("UserNotifications");
  };

  // === Alternar menú lateral ===
  const toggleMenu = () => {
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

  // === Colores por rol ===
  const getRoleColor = () => {
    if (role === "admin") return "#014869";
    if (role === "organizer") return "#F3B23F";
    return "#0072B5";
  };

  // === Header dinámico ===
  const renderHeaderBar = () => {
    const color = getRoleColor();
    const iconUser =
      role === "admin" ? "👑" : role === "organizer" ? "🟠" : "🟣";

    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
        }}
      >
        <Text>
          {iconUser} {role === "admin" ? "Admin." : ""} {userName}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable style={{ marginHorizontal: 8 }} onPress={goToNotifications}>
            <Image
              source={require("../assets/iconos/bell.png")}
              style={{ width: 22, height: 22, tintColor: color }}
            />
          </Pressable>

          <Pressable onPress={toggleMenu}>
            <Image
              source={
                Platform.OS === "web" && menuVisible
                  ? require("../assets/iconos/close.png")
                  : require("../assets/iconos/menu-usuario.png")
              }
              style={{ width: 26, height: 26, tintColor: color }}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  // === Menú lateral dinámico ===
  const getMenuItems = () => {
    if (role === "admin") {
      return [
        { label: "Perfil", route: "AdminProfile" },
        { label: "Cultura e Historia", route: "CulturaHistoria" },
        { label: "Ver usuarios", route: "AdminUsers" },
        { label: "Contacto", route: "Contacto" },
      ];
    } else if (role === "organizer") {
      return [
        { label: "Perfil", route: "OrganizerProfile" },
        { label: "Cultura e Historia", route: "CulturaHistoria" },
        { label: "Contacto", route: "Contacto" },
      ];
    } else {
      return [
        { label: "Perfil", route: "UserProfile" },
        { label: "Cultura e Historia", route: "CulturaHistoria" },
        { label: "Ver favoritos", route: "UserFavorites" },
        { label: "Contacto", route: "Contacto" },
      ];
    }
  };

  const simulateNavigation = (route) => {
    toggleMenu();
    navigation.navigate(route);
  };

  // === Render principal ===
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {renderHeaderBar()}

      {/* === MENÚ LATERAL WEB === */}
      {Platform.OS === "web" && menuVisible && (
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
            {getMenuItems().map((item, i) => (
              <Pressable
                key={i}
                onPress={() => simulateNavigation(item.route)}
                style={{ marginBottom: 25 }}
              >
                <Text
                  style={{
                    color: getRoleColor(),
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
      )}

      {/* === CONTENIDO PRINCIPAL === */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 24,
          alignItems: "center",
          backgroundColor: "#f9f9f9",
          flexGrow: 1,
        }}
      >
        {/* TÍTULO */}
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

        {/* CONTENEDOR DOBLE */}
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
          {/* === TÉRMINOS GENERALES === */}
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
            <Text
              style={{
                color: "#333",
                lineHeight: 20,
                textAlign: "justify",
              }}
            >
              El uso de la aplicación Cuervo Activa implica la aceptación plena
              de los presentes términos y condiciones. Los usuarios se comprometen
              a utilizar la plataforma de manera responsable, sin realizar acciones
              que perjudiquen su funcionamiento o la experiencia de otros usuarios.
              {"\n\n"}
              Queda prohibido publicar contenido ofensivo, fraudulento, violento o
              que infrinja derechos de autor o privacidad. Cuervo Activa se reserva
              el derecho de eliminar cualquier contenido inapropiado y suspender
              cuentas que vulneren estas normas.
              {"\n\n"}
              El acceso a ciertos servicios puede requerir registro previo y la
              veracidad de la información proporcionada es responsabilidad del
              usuario.
            </Text>
          </View>

          {/* === RESPONSABILIDAD Y USO === */}
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
            <Text
              style={{
                color: "#333",
                lineHeight: 20,
                textAlign: "justify",
              }}
            >
              Cuervo Activa no se hace responsable del mal uso de la aplicación
              ni de los daños derivados del incumplimiento de las normas por parte
              del usuario. Las actividades y eventos publicados son responsabilidad
              de sus respectivos organizadores.
              {"\n\n"}
              El usuario acepta que su participación en actividades es voluntaria y
              que deberá revisar los detalles, condiciones y requisitos de cada
              evento antes de asistir.
              {"\n\n"}
              La plataforma podrá suspender temporalmente el servicio por
              mantenimiento o mejoras, notificando a los usuarios cuando sea posible.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* === FOOTER === */}
      {Platform.OS === "web" && (
        <Footer
          onAboutPress={() => navigation.navigate("SobreNosotros")}
          onPrivacyPress={() => navigation.navigate("PoliticaPrivacidad")}
        />
      )}
    </View>
  );
}
