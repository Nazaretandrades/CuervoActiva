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

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";

export default function SobreNosotros({ navigation }) {
  const [role, setRole] = useState("user");
  const [userName, setUserName] = useState("Usuario");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // === Obtener sesión (nombre y rol) ===
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
        else setUserName("Usuario");

        if (session?.user?.role) setRole(session.user.role);
        else if (session?.role) setRole(session.role);
        else setRole("user");
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

  // === Texto principal ===
  const content = `Cuervo Activa es una aplicación multiplataforma creada para fomentar la participación ciudadana y la difusión cultural en el municipio de El Cuervo de Sevilla. 
Su objetivo principal es ofrecer un espacio digital donde los vecinos puedan descubrir, promover y participar en los distintos eventos, actividades y celebraciones locales de una forma sencilla, rápida y accesible.

La aplicación permite que tanto los organizadores como el propio Ayuntamiento gestionen eventos de carácter deportivo, cultural, social o educativo, centralizando toda la información en una única herramienta. 
Por su parte, los usuarios pueden consultar el calendario de actividades, añadir eventos a sus favoritos, recibir notificaciones y mantenerse al día sobre todo lo que ocurre en su localidad.

Cuervo Activa busca modernizar la comunicación entre la administración y la ciudadanía, impulsando la vida social y el sentido de comunidad mediante la tecnología.`;

  // === Colores según rol ===
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
        <Text style={{ color, fontWeight: "bold" }}>
          {iconUser} {role === "admin" ? "Admin." : ""} {userName}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* 🔔 Icono notificaciones */}
          <Pressable style={{ marginHorizontal: 8 }} onPress={goToNotifications}>
            <Image
              source={require("../assets/iconos/bell.png")}
              style={{ width: 22, height: 22, tintColor: color }}
            />
          </Pressable>

          {/* ☰ Menú lateral */}
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

  // === Menús por rol ===
  const getMenuItems = () => {
    if (role === "admin") {
      return [
        { label: "Perfil", route: "Perfil" },
        { label: "Cultura e Historia", route: "Cultura e Historia" },
        { label: "Ver usuarios", route: "AdminUsers" },
        { label: "Contacto", route: "Contacto" },
      ];
    } else if (role === "organizer") {
      return [
        { label: "Perfil", route: "Perfil" },
        { label: "Cultura e Historia", route: "Cultura e Historia" },
        { label: "Contacto", route: "Contacto" },
      ];
    } else {
      return [
        { label: "Perfil", route: "Perfil" },
        { label: "Cultura e Historia", route: "Cultura e Historia" },
        { label: "Ver favoritos", route: "UserFavorites" },
        { label: "Contacto", route: "Contacto" },
      ];
    }
  };

  // === Simular navegación ===
  const simulateNavigation = (route) => {
    toggleMenu();
    navigation.navigate(route);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {renderHeaderBar()}

      {/* === MENÚ WEB === */}
      {Platform.OS === "web" && (
        <>
          {menuVisible && (
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
          )}

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

      {/* === MENÚ MÓVIL === */}
      {Platform.OS !== "web" && menuVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#f8f8f8",
            zIndex: 20,
            paddingHorizontal: 24,
            paddingTop: 60,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            <Pressable onPress={toggleMenu} style={{ marginRight: 15 }}>
              <Image
                source={require("../assets/iconos/back-usuario.png")}
                style={{ width: 22, height: 22, tintColor: getRoleColor() }}
              />
            </Pressable>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: getRoleColor(),
                textAlign: "center",
                flex: 1,
              }}
            >
              Menú
            </Text>
          </View>

          {/* Opciones dinámicas por rol */}
          <View style={{ flex: 1 }}>
            {getMenuItems().map((item, i) => (
              <Pressable
                key={i}
                onPress={() => simulateNavigation(item.route)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 25,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={require("../assets/iconos/info-usuario.png")}
                    style={{
                      width: 24,
                      height: 24,
                      tintColor: getRoleColor(),
                      marginRight: 14,
                    }}
                  />
                  <Text
                    style={{
                      color: getRoleColor(),
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
                <Image
                  source={require("../assets/iconos/siguiente.png")}
                  style={{
                    width: 18,
                    height: 18,
                    tintColor: getRoleColor(),
                  }}
                />
              </Pressable>
            ))}
          </View>

          {/* Barra inferior */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: `${getRoleColor()}33`,
              paddingVertical: 14,
            }}
          >
            <Image
              source={require("../assets/iconos/search.png")}
              style={{ width: 22, height: 22, tintColor: getRoleColor() }}
            />
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={{ width: 22, height: 22, tintColor: getRoleColor() }}
            />
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 22, height: 22, tintColor: getRoleColor() }}
            />
          </View>
        </View>
      )}

      {/* === CONTENIDO PRINCIPAL === */}
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: 30,
          paddingVertical: 20,
          position: "relative",
        }}
      >
        {/* Imagen de fondo */}
        <Image
          source={require("../assets/fondo.png")}
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            width: "100%",
            height: "90%",
            opacity: 0.08,
            resizeMode: "contain",
          }}
        />

        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            color: getRoleColor(),
            marginBottom: 20,
          }}
        >
          Sobre nosotros
        </Text>

        <Text
          style={{
            textAlign: "justify",
            fontSize: 15,
            lineHeight: 22,
            color: "#333",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: 5,
          }}
        >
          {content}
        </Text>
      </ScrollView>

      {/* === FOOTER === */}
      {Platform.OS === "web" && (
        <Footer onAboutPress={() => navigation.navigate("SobreNosotros")} />
      )}
    </View>
  );
}
