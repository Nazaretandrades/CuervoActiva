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
          Política y Privacidad
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
          {/* === POLÍTICA === */}
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
            <Text
              style={{
                color: "#333",
                lineHeight: 20,
                textAlign: "justify",
              }}
            >
              Cuervo Activa se compromete a garantizar un uso responsable de la
              aplicación y el respeto entre los usuarios. Todos los contenidos,
              eventos y publicaciones deben promover la convivencia y cumplir con la
              normativa vigente. Cualquier uso indebido, ofensivo o que vulnere los
              derechos de terceros será motivo de suspensión o eliminación del
              acceso a la plataforma.
              {"\n\n"}
              La aplicación puede modificar sus políticas en cualquier momento para
              mejorar la experiencia o adaptarse a nuevas regulaciones, notificando
              los cambios a través de la misma.
            </Text>
          </View>

          {/* === PRIVACIDAD === */}
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
            <Text
              style={{
                color: "#333",
                lineHeight: 20,
                textAlign: "justify",
              }}
            >
              En Cuervo Activa, la protección de tus datos personales es una
              prioridad. Solo se recogen los datos estrictamente necesarios (nombre,
              correo electrónico, rol y participación en eventos) para ofrecer un
              servicio personalizado.
              {"\n\n"}
              Cumplimos con la normativa europea de protección de datos (RGPD) y
              garantizamos que la información no será compartida con terceros sin tu
              consentimiento, salvo requerimiento legal. Puedes ejercer tus derechos
              de acceso, modificación o eliminación escribiendo a{" "}
              <Text style={{ color: "#014869", fontWeight: "bold" }}>
                soporte@cuervoactiva.com
              </Text>
              .
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
