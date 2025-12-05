// Componente Header
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Platform,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // Asegura que el contenido no se solape con zonas inseguras en iOS/Android.
import AsyncStorage from "@react-native-async-storage/async-storage"; // Para guardar y cargar la sesión del usuario en móvil
import { useNavigation } from "@react-navigation/native"; // Para obtener la navegación dentro del componente

// Se declara el componente 
export default function Header({
  onLogin,
  onRegister,
  hideAuthButtons = false,
  onHeaderHeight,
}) {

  // Obtiene el objeto de navegación
  const navigation = useNavigation();
  // Determina si estás en móvil usando el ancho de pantalla
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Guarda el color del borde inferior según el rol
  const [roleColor, setRoleColor] = useState("#02486b");

  // UseEffect para cargar el rol desde la sesión
  useEffect(() => {

    // Carga la sesión según el sistema
    const loadRole = async () => {
      let session;

      // En web
      if (Platform.OS === "web")
        session = JSON.parse(localStorage.getItem("USER_SESSION"));
      else {
        // En móvil
        const s = await AsyncStorage.getItem("USER_SESSION");
        session = s ? JSON.parse(s) : null;
      }
      // Extrae el rol que permite compatibilidad con diferentes formatos de sesión
      const role =
        session?.user?.role || session?.role || session?.userType || "user";

        // Cambia el color dinámicamente
      if (role === "admin") setRoleColor("#0094A2");
      else if (role === "organizer" || role === "organizador")
        setRoleColor("#F3B23F");
      else setRoleColor("#02486b");
    };

    loadRole();
  }, []);

  // Función para navegar dependiendo del rol. Carga la sesión de nuevo.
  const handleLogoPress = async () => {
    try {
      let session;

      if (Platform.OS === "web") {
        session = JSON.parse(localStorage.getItem("USER_SESSION"));
      } else {
        const sessionString = await AsyncStorage.getItem("USER_SESSION");
        session = sessionString ? JSON.parse(sessionString) : null;
      }

      // Si no hay sesión -> navegar a Intro
      if (!session || !session.token) {
        navigation.navigate("Intro");
        return;
      }

      const role =
        session.user?.role || session.role || session.userType || "user";

      // Si está logueado ->  navegar según rol:
      if (role === "admin") navigation.navigate("Admin");
      else if (role === "organizer" || role === "organizador")
        navigation.navigate("Organizer");
      else navigation.navigate("User");
    } catch (error) {
      navigation.navigate("Intro");
    }
  };

  // Estilos
  const styles = {
    container: {
      backgroundColor: "#02486b",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isMobile ? 14 : 24,
      paddingVertical: isMobile ? 10 : 18,
      width: "100%",
    },
    logoContainer: {
      width: isMobile ? 38 : 50,
      height: isMobile ? 38 : 50,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: "#fff",
    },
    logo: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    title: {
      color: "#fff",
      fontWeight: "700",
      fontSize: isMobile ? 15 : 17,
      letterSpacing: 0.6,
    },
    button: {
      backgroundColor: "#F3B23F",
      paddingVertical: isMobile ? 5 : 8,
      paddingHorizontal: isMobile ? 10 : 14,
      borderRadius: 6,
      marginLeft: 10,
    },
    buttonText: {
      color: "#fff",
      fontSize: isMobile ? 12 : 14,
      fontWeight: "bold",
    },
  };

  // En movil nativo
  if (Platform.OS === "android") {
    return (
      <View style={{ backgroundColor: "#fff" }}>
        <SafeAreaView
          style={{
            backgroundColor: "#02486b",
            paddingTop:
              Platform.OS === "android" ? StatusBar.currentHeight || 15 : 0,
            borderBottomColor: roleColor,
            borderBottomWidth: 5,
          }}
        >
          <View
            style={{
              backgroundColor: "#02486b",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 14,
              paddingVertical: 12,
              width: "100%",
            }}
          >
            <Pressable
              onPress={handleLogoPress}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: "#fff",
                }}
              >
                <Image
                  source={require("../assets/logo.png")}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
            </Pressable>

            {!hideAuthButtons && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Pressable
                  onPress={onLogin}
                  style={{
                    backgroundColor: "#F3B23F",
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderRadius: 6,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}
                  >
                    Iniciar Sesión
                  </Text>
                </Pressable>

                <Pressable
                  onPress={onRegister}
                  style={{
                    backgroundColor: "#F3B23F",
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                    borderRadius: 6,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}
                  >
                    Registrarse
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // En web
  return (
    <>
      <View
        style={styles.container}
        onLayout={(e) => onHeaderHeight?.(e.nativeEvent.layout.height)}
      >
        <Pressable onPress={handleLogoPress} style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
          </View>

          {!isMobile && (
            <Text
              style={[
                styles.title,
                {
                  marginLeft:
                    width < 600 ? 8 : width < 1024 ? 12 : 18,
                },
              ]}
            >
              CUERVO ACTIVA
            </Text>
          )}
        </Pressable>

        {!hideAuthButtons && (
          <View style={{ flexDirection: "row" }}>
            <Pressable onPress={onLogin} style={styles.button}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </Pressable>
            <Pressable onPress={onRegister} style={styles.button}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={{ height: 5, backgroundColor: roleColor }} />
    </>
  );
}
