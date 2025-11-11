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
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

/**
 * Componente: Header
 * Barra superior de la aplicación (visible tanto en web como en móvil).
 * Muestra el logotipo, botones de autenticación (login y registro)
 * y cambia el color inferior según el rol del usuario (admin, organizador, usuario).
 */
export default function Header({
  onLogin,
  onRegister,
  hideAuthButtons = false, // Permite ocultar los botones de autenticación si se requiere
}) {
  const navigation = useNavigation(); // Navegación interna (React Navigation)
  const { width } = useWindowDimensions(); // Detecta el ancho de pantalla
  const isMobile = width < 768; // Considera "móvil" si el ancho es menor a 768px

  // Estados para controlar efectos visuales y rol del usuario
  const [hoverLogin, setHoverLogin] = useState(false);
  const [hoverRegister, setHoverRegister] = useState(false);
  const [roleColor, setRoleColor] = useState("#02486b"); // Color del borde inferior según rol
  const [userRole, setUserRole] = useState(null);

  /**
   * Efecto secundario: Detectar el rol del usuario logueado.
   * Se ejecuta una vez al montar el componente.
   * Busca la sesión almacenada (en localStorage o AsyncStorage)
   * y determina el color decorativo del header según el rol.
   */
  useEffect(() => {
    const loadRole = async () => {
      try {
        let session;

        // Web → usamos localStorage
        if (Platform.OS === "web") {
          session = JSON.parse(localStorage.getItem("USER_SESSION"));
        } 
        // Móvil → usamos AsyncStorage
        else {
          const sessionString = await AsyncStorage.getItem("USER_SESSION");
          session = sessionString ? JSON.parse(sessionString) : null;
        }

        // Determinamos el rol (por si el formato varía entre plataformas)
        const role =
          session?.user?.role || session?.role || session?.userType || "user";
        setUserRole(role);

        // Asignamos color según rol
        if (role === "admin") setRoleColor("#0094A2"); 
        else if (role === "organizer" || role === "organizador")
          setRoleColor("#F3B23F"); 
        else setRoleColor("#02486b"); 
      } catch (err) {
        console.error("Error detectando rol:", err);
      }
    };

    loadRole();
  }, []);

  /**
   * handleLogoPress
   * Define la navegación al pulsar el logo:
   * - Si no hay sesión → va a la pantalla "Intro"
   * - Si hay sesión → redirige según el rol del usuario
   */
  const handleLogoPress = async () => {
    try {
      let session;
      if (Platform.OS === "web") {
        session = JSON.parse(localStorage.getItem("USER_SESSION"));
      } else {
        const sessionString = await AsyncStorage.getItem("USER_SESSION");
        session = sessionString ? JSON.parse(sessionString) : null;
      }

      // Si no hay sesión activa → pantalla de introducción
      if (!session || !session.token) {
        navigation.navigate("Intro");
        return;
      }

      // Si existe sesión, navegamos según el rol
      const role =
        session.user?.role || session.role || session.userType || "user";

      if (role === "admin") navigation.navigate("Admin");
      else if (role === "organizer" || role === "organizador")
        navigation.navigate("Organizer");
      else navigation.navigate("User");
    } catch {
      navigation.navigate("Intro");
    }
  };

  /**
   * Estilos del componente
   * (Definidos como objeto JS para adaptarse dinámicamente según el tamaño de pantalla)
   */
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
      marginRight: isMobile ? 6 : 10,
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
      marginRight: isMobile ? 8 : 12,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    buttonText: {
      color: "#fff",
      fontSize: isMobile ? 12 : 14,
      fontWeight: "600",
    },
    separatorRole: {
      height: 5,
      backgroundColor: roleColor,
      width: "100%",
    },
  };

  // ===========================
  // MODO MÓVIL
  // ===========================
  if (Platform.OS === "android" || Platform.OS === "ios") {
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
          <View style={styles.container}>
            {/* Logo principal */}
            <Pressable
              onPress={handleLogoPress}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/logo.png")}
                  style={styles.logo}
                />
              </View>
            </Pressable>

            {/* Botones de autenticación (opcionalmente ocultos) */}
            {!hideAuthButtons && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Pressable
                  onPress={onLogin}
                  android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && { backgroundColor: "#d99b30" },
                  ]}
                >
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </Pressable>

                <Pressable
                  onPress={onRegister}
                  android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && { backgroundColor: "#d99b30" },
                  ]}
                >
                  <Text style={styles.buttonText}>Registrarse</Text>
                </Pressable>
              </View>
            )}
          </View>
        </SafeAreaView>

        {/* Línea decorativa blanca debajo del header */}
        <View style={styles.separatorWhite} />
      </View>
    );
  }

  // ===========================
  // MODO WEB
  // ===========================
  return (
    <>
      <View style={styles.container}>
        {/* Logo + nombre del proyecto */}
        <Pressable
          onPress={handleLogoPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
          </View>
          <Text style={styles.title}>CUERVO ACTIVA</Text>
        </Pressable>

        {/* Botones de autenticación (login / register) */}
        {!hideAuthButtons && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable onPress={onLogin} style={styles.button}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </Pressable>

            <Pressable onPress={onRegister} style={styles.button}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Líneas decorativas bajo el header */}
      <View style={styles.separatorWhite} />
      <View style={styles.separatorRole} />
    </>
  );
}
