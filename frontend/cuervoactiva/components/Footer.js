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
  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error al abrir el enlace:", error);
    }
  };

  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  // --- ARREGLO RESPONSIVE EN WEB ---
  const dims = useWindowDimensions();
  const [winWidth, setWinWidth] = useState(
    Platform.OS === "web" ? window.innerWidth : dims.width
  );

  useEffect(() => {
    if (Platform.OS === "web") {
      const onResize = () => setWinWidth(window.innerWidth);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  const isWeb = Platform.OS === "web";
  const isNarrowWeb = isWeb && winWidth < 768;

  return (
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
      <View
        style={{
          flexDirection: isNarrowWeb ? "column" : "row",
          justifyContent: isNarrowWeb ? "center" : "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          rowGap: isNarrowWeb ? 8 : 0,
        }}
      >
        {/* LEFT SECTION */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: isNarrowWeb ? "center" : "flex-start",
            marginBottom: isNarrowWeb ? 6 : 0,
          }}
        >
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

        {/* RIGHT SECTION */}
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
