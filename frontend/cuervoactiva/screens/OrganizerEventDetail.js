// Pantalla de detalle evento organizador
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Modal,
  Linking,
  Dimensions,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { getSession } from "../services/sessionManager";
import { useNavigation } from "@react-navigation/native";
import OrganizerMenu from "./OrganizerMenu";
import Constants from "expo-constants";

const BASE_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://localhost:5000");

const API_URL = `${BASE_URL}/api/events`;
const COMMENTS_URL = `${BASE_URL}/api/comments`;

// Declaro el componente
export default function OrganizerEventDetail({ route }) {
  // Estados
  const { eventId } = route?.params || {};
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [organizerName, setOrganizerName] = useState("Organizador");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [shareVisible, setShareVisible] = useState(false);
  const navigation = useNavigation();

  // Responsive
  const [winWidth, setWinWidth] = useState(
    Platform.OS === "web" ? window.innerWidth : Dimensions.get("window").width
  );
  // Función para redimensionar en tiempo real
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const resize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  // Breakpoints
  const isWeb = Platform.OS === "web";
  const isMobileWeb = isWeb && winWidth < 768;
  const isTabletWeb = isWeb && winWidth >= 768 && winWidth < 1024;
  const isLaptopWeb = isWeb && winWidth >= 1024 && winWidth < 1440;
  const isDesktopWeb = isWeb && winWidth >= 1440;
  const isLargeWeb = isLaptopWeb || isDesktopWeb;
  const pagePaddingHorizontal = isMobileWeb
    ? 20
    : isTabletWeb
    ? 40
    : isLaptopWeb
    ? 55
    : 80;
  const pagePaddingBottom = isLargeWeb ? 80 : 30;
  const eventContainerWidth = isMobileWeb
    ? "100%"
    : isTabletWeb
    ? "100%"
    : isLaptopWeb
    ? "100%"
    : "100%";

  // Cargar organizador
  useEffect(() => {
    const loadOrganizer = async () => {
      const session = await getSession();
      if (session?.name) setOrganizerName(session.name);
    };
    loadOrganizer();
  }, []);

  // Cargar eventos + comentarios
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const session = await getSession();
        const token = session?.token;

        const res = await fetch(`${API_URL}/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar evento");

        const data = await res.json();
        setEvent(data);

        // Solo ver comentarios si el evento es suyo
        if (data.createdBy !== session.id) {
          setComments([]);
          return;
        }

        const resComments = await fetch(`${COMMENTS_URL}/${eventId}`);
        if (resComments.ok) {
          const commentsData = await resComments.json();
          setComments(commentsData);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (eventId) loadEvent();
  }, [eventId]);

  // Navegación
  const goToProfile = () => navigation.navigate("OrganizerProfile");
  const goToNotifications = () => navigation.navigate("OrganizerNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToOrganizer = () => navigation.navigate("Organizer");

  // Menú
  const toggleMenu = () => {
    if (!isWeb) {
      setMenuVisible(!menuVisible);
      return;
    }

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

  // Cargar las estrellas de las valoraciones
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          style={{
            fontSize: 18,
            color: i <= rating ? "#014869" : "#ccc",
            marginRight: 3,
          }}
        >
          {i <= rating ? "★" : "☆"}
        </Text>
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  // Compartir por WhatsApp
  const shareWhatsApp = () => {
    if (!event) return;

    const msg = `¡Mira este evento!
                  Título: ${event.title}
                  Lugar: ${event.location}
                  Fecha: ${event.date}
                  Hora: ${event.hour}`;

    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
  };

  // Compartir por Twitter (X)
  const shareTwitter = () => {
    if (!event) return;

    const msg = `¡Mira este evento! 
                ${event.title} - ${event.location} 
                📅 ${event.date} | ⏰ ${event.hour}`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      msg
    )}`;
    Linking.openURL(url);
  };

  // Return web responsive + móvil
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* Cabecera organizador */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 24,
          paddingVertical: 14,
          justifyContent: "space-between",
          backgroundColor: "#fff",
        }}
      >
        {/* Usuario */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              position: "relative",
              marginRight: 12,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#F3B23F",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 24, height: 24, tintColor: "#fff" }}
            />
            <Image
              source={require("../assets/iconos/lapiz.png")}
              style={{
                position: "absolute",
                top: -6,
                left: -6,
                width: 20,
                height: 20,
                resizeMode: "contain",
                transform: [{ rotate: "-20deg" }],
              }}
            />
          </View>

          <View>
            <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
              Organiz.
            </Text>
            <Text style={{ color: "#6c757d", fontSize: 13 }}>
              {organizerName}
            </Text>
          </View>
        </View>

        {/* Iconos */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={goToOrganizer}
            style={{ marginRight: 18, ...(isWeb ? { cursor: "pointer" } : {}) }}
          >
            <Image
              source={require("../assets/iconos/add-organizador.png")}
              style={{ width: 24, height: 30, tintColor: "#F3B23F" }}
            />
          </Pressable>

          <Pressable
            onPress={goToNotifications}
            style={{ marginRight: 18, ...(isWeb ? { cursor: "pointer" } : {}) }}
          >
            <Image
              source={require("../assets/iconos/bell3.png")}
              style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
            />
          </Pressable>

          <Pressable
            onPress={goToCalendar}
            style={{ marginRight: 18, ...(isWeb ? { cursor: "pointer" } : {}) }}
          >
            <Image
              source={require("../assets/iconos/calendar-organizador.png")}
              style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
            />
          </Pressable>

          <Pressable
            onPress={toggleMenu}
            style={isWeb ? { cursor: "pointer" } : {}}
          >
            <Image
              source={
                menuVisible
                  ? require("../assets/iconos/close-organizador.png")
                  : require("../assets/iconos/menu-organizador.png")
              }
              style={{ width: 24, height: 24, tintColor: "#F3B23F" }}
            />
          </Pressable>
        </View>
      </View>

      {/* Menú lateral web */}
      {isWeb && menuVisible && (
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
            {[
              { label: "Perfil", action: goToProfile },
              { label: "Cultura e Historia", action: goToCulturaHistoria },
              { label: "Contacto", action: goToContact },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  toggleMenu();
                  item.action();
                }}
                style={{ marginBottom: 25 }}
              >
                <Text
                  style={{
                    color: "#014869",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </>
      )}

      {/* Menú móvil */}
      {!isWeb && menuVisible && <OrganizerMenu onClose={toggleMenu} />}

      {/* Evento */}
      {event &&
        (isWeb ? (
          /* Web responsive */
          <View
            style={{
              flex: 1,
              backgroundColor: "#f5f6f7",
              paddingHorizontal: pagePaddingHorizontal,
              paddingTop: 20,
              paddingBottom: pagePaddingBottom,
              alignItems: "center",
            }}
          >
            <ScrollView
              style={{
                flex: 1,
                width: eventContainerWidth,
              }}
              contentContainerStyle={{
                paddingBottom: 40,
              }}
            >
              {/* Título */}
              <View
                style={{
                  backgroundColor: "#014869",
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  marginBottom: 20,
                  borderRadius: 3,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 15,
                  }}
                >
                  {event.title}
                </Text>
              </View>

              {/* 2 columnas */}
              <View
                style={{
                  flexDirection: isLargeWeb ? "row" : "column",
                  justifyContent: isLargeWeb ? "space-between" : "center",
                  alignItems: isLargeWeb ? "flex-start" : "center",
                  gap: 20,
                }}
              >
                {/* Imagen */}
                <Image
                  source={{
                    uri:
                      Platform.OS === "android"
                        ? event.image_url.replace("localhost", "10.0.2.2")
                        : event.image_url,
                  }}
                  style={{
                    width: isLargeWeb ? "50%" : "100%",
                    height: isLargeWeb ? 250 : 220,
                    borderRadius: 8,
                    marginBottom: isLargeWeb ? 0 : 15,
                  }}
                  resizeMode="cover"
                />

                {/* Descripción */}
                <View style={{ width: isLargeWeb ? "48%" : "100%" }}>
                  <Text
                    style={{
                      color: "#014869",
                      fontWeight: "bold",
                      fontSize: 15,
                      marginBottom: 8,
                    }}
                  >
                    Descripción
                  </Text>

                  <Text
                    style={{
                      color: "#333",
                      fontSize: 14,
                      lineHeight: 20,
                      textAlign: "justify",
                    }}
                  >
                    {event.description}
                  </Text>
                </View>
              </View>

              {/* Estado + compartir */}
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 30,
                  gap: 20,
                }}
              >
                <View
                  style={{
                    backgroundColor:
                      new Date(event.date) > new Date() ? "#2ECC71" : "#E74C3C",
                    borderRadius: 25,
                    paddingVertical: 7,
                    paddingHorizontal: 18,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: 13,
                    }}
                  >
                    {new Date(event.date) > new Date()
                      ? "Habilitado"
                      : "Deshabilitado"}
                  </Text>
                </View>

                <Pressable onPress={() => setShareVisible(true)}>
                  <Image
                    source={require("../assets/iconos/compartir.png")}
                    style={{ width: 26, height: 26, tintColor: "#014869" }}
                  />
                </Pressable>
              </View>

              {/* Valoraciones */}
              <View style={{ marginTop: isTabletWeb ? 5 : 25 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    color: "#014869",
                    marginBottom: isTabletWeb ? -4 : 0,
                    fontSize: 14,
                  }}
                >
                  Valoraciones de usuarios
                </Text>

                <ScrollView
                  style={{
                    maxHeight: 160,
                    backgroundColor: "#f9f9f9",
                    borderRadius: 8,
                    padding: 10,
                  }}
                >
                  {comments.length > 0 ? (
                    comments.map((c, i) => (
                      <View
                        key={i}
                        style={{
                          marginBottom: 12,
                          borderBottomWidth: 0.5,
                          borderBottomColor: "#ddd",
                          paddingBottom: 8,
                        }}
                      >
                        {/* Nombre + Estrellas */}
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#014869",
                              fontWeight: "600",
                            }}
                          >
                            {c.user?.name || "Usuario"}
                          </Text>

                          {renderStars(c.rating)}
                        </View>

                        {/* Texto */}
                        {c.text && c.text.trim() !== "" && (
                          <Text
                            style={{
                              marginTop: 6,
                              color: "#333",
                              fontSize: 13,
                              lineHeight: 18,
                              fontStyle: "italic",
                            }}
                          >
                            "{c.text}"
                          </Text>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={{ color: "#777", fontStyle: "italic" }}>
                      Sin valoraciones aún.
                    </Text>
                  )}
                </ScrollView>
              </View>
            </ScrollView>
          </View>
        ) : (
          /* Móvil nativo */
          <ScrollView
            style={{
              flex: 1,
              backgroundColor: "#f5f6f7",
              padding: 25,
            }}
            contentContainerStyle={{
              paddingBottom: 40,
            }}
          >
            {/* Título */}
            <View
              style={{
                backgroundColor: "#014869",
                paddingVertical: 10,
                paddingHorizontal: 15,
                marginBottom: 20,
                borderRadius: 3,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 15,
                }}
              >
                {event.title}
              </Text>
            </View>

            {/* Imagen móvil */}
            {event.image_url ? (
              <Image
                source={{
                  uri:
                    Platform.OS === "android"
                      ? event.image_url.replace("localhost", "10.0.2.2")
                      : event.image_url,
                }}
                style={{
                  width: "100%",
                  height: 250,
                  borderRadius: 8,
                  marginBottom: 20,
                }}
                resizeMode="cover"
              />
            ) : null}

            {/* Descripción móvil */}
            <Text
              style={{
                color: "#014869",
                fontWeight: "bold",
                fontSize: 15,
                marginBottom: 6,
              }}
            >
              Descripción
            </Text>

            <Text
              style={{
                color: "#333",
                fontSize: 14,
                textAlign: "justify",
                lineHeight: 20,
              }}
            >
              {event.description}
            </Text>

            {/* Estado + Compartir móvil */}
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 15,
                gap: 15,
              }}
            >
              <View
                style={{
                  backgroundColor:
                    new Date(event.date) > new Date() ? "#2ECC71" : "#E74C3C",
                  borderRadius: 25,
                  paddingVertical: 7,
                  paddingHorizontal: 18,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 13,
                  }}
                >
                  {new Date(event.date) > new Date()
                    ? "Habilitado"
                    : "Deshabilitado"}
                </Text>
              </View>

              <Pressable onPress={() => setShareVisible(true)}>
                <Image
                  source={require("../assets/iconos/compartir.png")}
                  style={{ width: 26, height: 26, tintColor: "#014869" }}
                />
              </Pressable>
            </View>

            {/* Valoraciones móvil */}
            <View style={{ marginTop: 25 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  color: "#014869",
                  marginBottom: 8,
                  fontSize: 14,
                }}
              >
                Valoraciones de usuarios
              </Text>

              {comments.map((c, i) => (
                <View
                  key={i}
                  style={{
                    marginBottom: 8,
                    borderBottomWidth: 0.5,
                    borderBottomColor: "#ddd",
                    paddingBottom: 6,
                  }}
                >
                  {/* Nombre + estrellas */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#014869",
                        fontWeight: "600",
                        flex: 1,
                      }}
                    >
                      {c.user?.name || "Usuario"}
                    </Text>

                    {renderStars(c.rating)}
                  </View>

                  {/* Comentario (si existe) */}
                  {c.text && c.text.trim() !== "" && (
                    <Text
                      style={{
                        color: "#555",
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      {c.text}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        ))}

      {/* Modal compartir */}
      <Modal visible={shareVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              width: 300,
              borderRadius: 10,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: "#014869",
                marginBottom: 10,
              }}
            >
              Compartir evento
            </Text>

            <Pressable
              onPress={() => {
                setShareVisible(false);
                shareWhatsApp();
              }}
              style={{
                backgroundColor: "#25D366",
                width: "100%",
                alignItems: "center",
                borderRadius: 8,
                paddingVertical: 10,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                WhatsApp
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setShareVisible(false);
                shareTwitter();
              }}
              style={{
                backgroundColor: "#1DA1F2",
                width: "100%",
                alignItems: "center",
                borderRadius: 8,
                paddingVertical: 10,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Twitter</Text>
            </Pressable>

            <Pressable onPress={() => setShareVisible(false)}>
              <Text style={{ color: "#014869", fontWeight: "bold" }}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Footer web */}
      {isWeb && isLargeWeb && (
        <View
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            zIndex: 100,
          }}
        >
          <Footer
            onAboutPress={goToAboutUs}
            onPrivacyPress={goToPrivacy}
            onConditionsPress={goToConditions}
          />
        </View>
      )}
    </View>
  );
}
