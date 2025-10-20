import React from "react";
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

export default function Header({
  onLogin,
  onRegister,
  hideAuthButtons = false,
}) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768; // breakpoint para pantallas pequeñas

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
      borderRadius: 10, // redondeo más suave
      overflow: "hidden", // 🔹 esto recorta la imagen dentro del borde
      backgroundColor: "#fff", // por si el logo tiene transparencia
    },
    logo: {
      width: "100%",
      height: "100%",
      resizeMode: "cover", // asegura que llene el contenedor sin distorsión
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
    separatorWhite: {
      height: 6,
      backgroundColor: "#ffffff",
      width: "100%",
    },
    separatorBlue: {
      height: Platform.OS === "android" ? 1 : 5,
      backgroundColor: "#02486b",
      width: "100%",
    },
  };

  console.log(
    "Tipo de hideAuthButtons:",
    typeof hideAuthButtons,
    hideAuthButtons
  );

  // ✅ Versión móvil
  if (Platform.OS === "android" || Platform.OS === "ios") {
    return (
      <SafeAreaView
        style={{
          backgroundColor: "#02486b",
          paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight || 15 : 0,
        }}
      >
        <View style={styles.container}>
          {/* IZQUIERDA */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/logo.png")}
                style={styles.logo}
              />
            </View>
            <Text style={styles.title}>CUERVO ACTIVA</Text>
          </View>

          {/* DERECHA */}
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

        {/* Línea blanca + azul */}
        <View style={styles.separatorWhite} />
        <View style={styles.separatorBlue} />
      </SafeAreaView>
    );
  }

  // 💻 Versión web
  return (
    <>
      <View style={styles.container}>
        {/* IZQUIERDA */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
          </View>
          <Text style={styles.title}>CUERVO ACTIVA</Text>
        </View>

        {/* DERECHA */}
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

      {/* Línea blanca + azul */}
      <View style={styles.separatorWhite} />
      <View style={styles.separatorBlue} />
    </>
  );
}
