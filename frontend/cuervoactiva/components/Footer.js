import React, { useState } from "react";
import { View, Text, Pressable, Image, Platform, Linking } from "react-native";

export default function Footer({ onAboutPress, onPrivacyPress, onConditionsPress }) {
  // 🌐 Abrir enlaces externos
  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error al abrir el enlace:", error);
    }
  };

  // Estados de hover (solo web)
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "#f5f5f5",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        paddingVertical: 12,
        paddingHorizontal: 28,
      }}
    >
      {/* Contenedor principal */}
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

          {/* PRIVACIDAD */}
          <Pressable
            onPress={onPrivacyPress}
            onHoverIn={() => setHoveredLink("privacidad")}
            onHoverOut={() => setHoveredLink(null)}
            style={{ marginHorizontal: 6, cursor: "pointer" }}
          >
            <Text
              style={{
                color: hoveredLink === "privacidad" ? "#222" : "#555",
                fontSize: 12,
                textDecorationLine:
                  hoveredLink === "privacidad" ? "underline" : "none",
                textDecorationColor: "#222",
                transition: "all 0.2s ease-in-out",
              }}
            >
              Privacidad
            </Text>
          </Pressable>

          {/* CONDICIONES */}
          <Pressable
            onPress={onConditionsPress}
            onHoverIn={() => setHoveredLink("condiciones")}
            onHoverOut={() => setHoveredLink(null)}
            style={{ marginHorizontal: 6, cursor: "pointer" }}
          >
            <Text
              style={{
                color: hoveredLink === "condiciones" ? "#222" : "#555",
                fontSize: 12,
                textDecorationLine:
                  hoveredLink === "condiciones" ? "underline" : "none",
                textDecorationColor: "#222",
                transition: "all 0.2s ease-in-out",
              }}
            >
              Condiciones
            </Text>
          </Pressable>

          {/* SOBRE NOSOTROS */}
          <Pressable
            onPress={onAboutPress}
            onHoverIn={() => setHoveredLink("sobre")}
            onHoverOut={() => setHoveredLink(null)}
            style={{ marginHorizontal: 6, cursor: "pointer" }}
          >
            <Text
              style={{
                color: hoveredLink === "sobre" ? "#222" : "#555",
                fontSize: 12,
                textDecorationLine:
                  hoveredLink === "sobre" ? "underline" : "none",
                textDecorationColor: "#222",
                transition: "all 0.2s ease-in-out",
              }}
            >
              Sobre Nosotros
            </Text>
          </Pressable>
        </View>

        {/* DERECHA — idioma + redes sociales */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
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

          {/* Redes sociales con hover */}
          {[
            {
              id: "facebook",
              icon: require("../assets/iconos/facebook.png"),
              url: "https://www.facebook.com/cuervoactiva",
            },
            {
              id: "twitter",
              icon: require("../assets/iconos/twitter.png"),
              url: "https://x.com/cuervoactiva",
            },
            {
              id: "instagram",
              icon: require("../assets/iconos/instagram.png"),
              url: "https://www.instagram.com/cuervoactiva",
            },
          ].map((item) => (
            <Pressable
              key={item.id}
              onPress={() => openLink(item.url)}
              onHoverIn={() => setHoveredIcon(item.id)}
              onHoverOut={() => setHoveredIcon(null)}
              style={{
                marginHorizontal: 6,
                cursor: "pointer",
                transform:
                  hoveredIcon === item.id ? [{ scale: 1.15 }] : [{ scale: 1 }],
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Image
                source={item.icon}
                style={{
                  width: 18,
                  height: 18,
                  tintColor: hoveredIcon === item.id ? "#000" : "#444",
                  opacity: hoveredIcon === item.id ? 1 : 0.8,
                }}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
