// Componente Footer
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Platform,
  Linking,
  useWindowDimensions,
} from "react-native";

export default function Footer({
  onAboutPress,
  onPrivacyPress,
  onConditionsPress,
}) {

  //Función para abrir enlaces
  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error al abrir el enlace:", error);
    }
  };

  // Estados de hover, para los links y para los iconos 
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  // Obtiene automáticamente el ancho de pantalla
  const dims = useWindowDimensions();
  const [winWidth, setWinWidth] = useState(
    Platform.OS === "web" ? window.innerWidth : dims.width
  );

  // UseEffect para escuchar cambios de tamaño en web, que actualiza el width en tiempo real
  useEffect(() => {
    if (Platform.OS === "web") {
      const onResize = () => setWinWidth(window.innerWidth);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  // Comprueba si es navegador
  const isWeb = Platform.OS === "web";
  // Comprueba si el ancho es menor de 768px (es un layout móvil)
  const isNarrowWeb = isWeb && winWidth < 768;

  // Contenedor principal
  return (
    // Fondo del footer
    <View
      style={{
        width: "100%",
        backgroundColor: "#f5f5f5",
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        paddingVertical: 12,
        paddingHorizontal: 16,
      }}
    >
      <View // Contenedor interno del layout, se hace el estilo responsive
        style={{
          flexDirection: isNarrowWeb ? "column" : "row",
          justifyContent: isNarrowWeb ? "center" : "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          rowGap: isNarrowWeb ? 8 : 0,
        }}
      >
        {/* Sección de la izquierda (Copyright + links) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: isNarrowWeb ? "center" : "flex-start",
            marginBottom: isNarrowWeb ? 6 : 0,
          }}
        >
          {/**Texto copyright */}
          <Text
            style={{
              color: "#555",
              fontSize: 12,
              marginRight: 10,
              textAlign: "center",
            }}
          >
            © 2025 CuervoActiva, Inc.
          </Text>

          {/** Enlaces de la izquierda*/}
          <Pressable
            onPress={onPrivacyPress}
            onHoverIn={() => setHoveredLink("privacidad")}
            onHoverOut={() => setHoveredLink(null)}
            style={{
              marginHorizontal: 6,
              ...(isWeb ? { cursor: "pointer" } : {}),
            }}
          >
            <Text
              style={{
                color: hoveredLink === "privacidad" ? "#222" : "#555",
                fontSize: 12,
                textDecorationLine:
                  hoveredLink === "privacidad" ? "underline" : "none",
              }}
            >
              Privacidad
            </Text>
          </Pressable>

          <Pressable
            onPress={onConditionsPress}
            onHoverIn={() => setHoveredLink("condiciones")}
            onHoverOut={() => setHoveredLink(null)}
            style={{
              marginHorizontal: 6,
              ...(isWeb ? { cursor: "pointer" } : {}),
            }}
          >
            <Text
              style={{
                color: hoveredLink === "condiciones" ? "#222" : "#555",
                fontSize: 12,
                textDecorationLine:
                  hoveredLink === "condiciones" ? "underline" : "none",
              }}
            >
              Condiciones
            </Text>
          </Pressable>

          <Pressable
            onPress={onAboutPress}
            onHoverIn={() => setHoveredLink("sobre")}
            onHoverOut={() => setHoveredLink(null)}
            style={{
              marginHorizontal: 6,
              ...(isWeb ? { cursor: "pointer" } : {}),
            }}
          >
            <Text
              style={{
                color: hoveredLink === "sobre" ? "#222" : "#555",
                fontSize: 12,
                textDecorationLine:
                  hoveredLink === "sobre" ? "underline" : "none",
              }}
            >
              Sobre Nosotros
            </Text>
          </Pressable>
        </View>

        {/* Sección de la derecha (idioma + redes sociales) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: isNarrowWeb ? "center" : "flex-end",
            marginTop: isNarrowWeb ? 4 : 0,
          }}
        >
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

          {[ 
            {
              id: "facebook",
              icon: require("../assets/iconos/facebook.png"),
              url: "https://www.facebook.com/profile.php?id=61583832168012",
            },
            {
              id: "twitter",
              icon: require("../assets/iconos/twitter.png"),
              url: "https://x.com/CuervoActiva",
            },
            {
              id: "instagram",
              icon: require("../assets/iconos/instagram.png"),
              url: "https://www.instagram.com/p/DRb_K0SiHDa",
            },
            // Recorre una lista de iconos, muestra el icono clicable
          ].map((item) => (
            <Pressable
              key={item.id}
              onPress={() => openLink(item.url)}
              onHoverIn={() => setHoveredIcon(item.id)}
              onHoverOut={() => setHoveredIcon(null)}
              style={{
                marginHorizontal: 6,
                ...(isWeb ? { cursor: "pointer" } : {}),
                transform:
                  hoveredIcon === item.id ? [{ scale: 1.15 }] : [{ scale: 1 }],
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
