import React from "react";
import { View, Text, Pressable, Image, Linking } from "react-native";

export default function Footer({ onAboutPress, onPrivacyPress }) {
  // 🌐 Abrir enlaces externos
  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error al abrir el enlace:", error);
    }
  };

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "#f5f5f5", // Fondo gris suave
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        paddingVertical: 12,
        paddingHorizontal: 28,
      }}
    >
      {/* Contenedor principal horizontal */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "nowrap",
        }}
      >
        {/* IZQUIERDA — textos legales */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "nowrap",
          }}
        >
          <Text style={{ color: "#555", fontSize: 12, marginRight: 10 }}>
            © 2025 CuervoActiva, Inc.
          </Text>

          {/* ✅ ENLACE ACTIVO A "Privacidad" */}
          <Pressable
            style={{ marginHorizontal: 6 }}
            onPress={() => {
              if (onPrivacyPress) {
                onPrivacyPress(); // Usa la navegación recibida desde el componente padre
              } else {
                console.warn(
                  "⚠️ No se pasó la función onPrivacyPress al Footer. Añádela en el componente padre."
                );
              }
            }}
          >
            <Text style={{ color: "#555", fontSize: 12 }}>Privacidad</Text>
          </Pressable>

          <Pressable style={{ marginHorizontal: 6 }}>
            <Text style={{ color: "#555", fontSize: 12 }}>Condiciones</Text>
          </Pressable>

          {/* ✅ ENLACE ACTIVO A "Sobre Nosotros" */}
          <Pressable
            style={{ marginHorizontal: 6 }}
            onPress={() => {
              if (onAboutPress) {
                onAboutPress(); // Usa la navegación recibida desde el componente padre
              } else {
                console.warn(
                  "⚠️ No se pasó la función onAboutPress al Footer. Añádela en el componente padre."
                );
              }
            }}
          >
            <Text
              style={{
                color: "#555",
                fontSize: 12,
              }}
            >
              Sobre Nosotros
            </Text>
          </Pressable>
        </View>

        {/* DERECHA — idioma + redes sociales */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* Idioma */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            <Image
              source={require("../assets/iconos/mundo.png")}
              style={{
                width: 15,
                height: 15,
                marginRight: 5,
                tintColor: "#666",
              }}
            />
            <Text style={{ color: "#555", fontSize: 12 }}>Español (ES)</Text>
          </View>

          {/* Redes sociales */}
          <Pressable
            style={{ marginHorizontal: 6 }}
            onPress={() => openLink("https://www.facebook.com/cuervoactiva")}
          >
            <Image
              source={require("../assets/iconos/facebook.png")}
              style={{
                width: 18,
                height: 18,
                tintColor: "#444",
                opacity: 0.8,
              }}
            />
          </Pressable>

          <Pressable
            style={{ marginHorizontal: 6 }}
            onPress={() => openLink("https://x.com/cuervoactiva")}
          >
            <Image
              source={require("../assets/iconos/twitter.png")}
              style={{
                width: 18,
                height: 18,
                tintColor: "#444",
                opacity: 0.8,
              }}
            />
          </Pressable>

          <Pressable
            style={{ marginLeft: 6 }}
            onPress={() => openLink("https://www.instagram.com/cuervoactiva")}
          >
            <Image
              source={require("../assets/iconos/instagram.png")}
              style={{
                width: 18,
                height: 18,
                tintColor: "#444",
                opacity: 0.8,
              }}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
