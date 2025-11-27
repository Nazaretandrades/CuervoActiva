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

const API_BASE =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const API_URL = `${API_BASE}/api/events`;
const COMMENTS_URL = `${API_BASE}/api/comments`;

export default function OrganizerEventDetail({ route }) {
  const { eventId } = route?.params || {};
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [organizerName, setOrganizerName] = useState("Organizador");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [shareVisible, setShareVisible] = useState(false);
  const navigation = useNavigation();
  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    const loadOrganizer = async () => {
      const session = await getSession();
      if (session?.name) setOrganizerName(session.name);
    };
    loadOrganizer();
  }, []);

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

  const goToProfile = () => navigation.navigate("OrganizerProfile");
  const goToNotifications = () => navigation.navigate("OrganizerNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToOrganizer = () => navigation.navigate("Organizer");

  const toggleMenu = () => {
    if (Platform.OS !== "web") {
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

  const shareWhatsApp = () => {
    if (!event) return;
    const msg = `¡Mira este evento! ${event.title} - ${event.location}`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url);
  };

  const shareTwitter = () => {
    if (!event) return;
    const msg = `¡Mira este evento! ${event.title} - ${event.location}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      msg
    )}`;
    Linking.openURL(url);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* CABECERA ORGANIZADOR */}
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

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => navigation.navigate("Organizer")}
            style={{ marginRight: 18 }}
          >
            <Image
              source={require("../assets/iconos/add-organizador.png")}
              style={{ width: 24, height: 30, tintColor: "#F3B23F" }}
            />
          </Pressable>

          <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
            <Image
              source={require("../assets/iconos/bell3.png")}
              style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
            />
          </Pressable>

          <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
            <Image
              source={require("../assets/iconos/calendar-organizador.png")}
              style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
            />
          </Pressable>

          <Pressable onPress={toggleMenu}>
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

      {/* MENÚ LATERAL (web) */}
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

      {/* MENÚ MÓVIL*/}
      {Platform.OS !== "web" && menuVisible && (
        <OrganizerMenu onClose={toggleMenu} />
      )}

      {event && (
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
          {Platform.OS === "web" ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 20,
                }}
              >
                <Image
                  source={{
                    uri:
                      Platform.OS === "android"
                        ? event.image_url.replace("localhost", "10.0.2.2")
                        : event.image_url,
                  }}
                  style={{
                    width: "50%",
                    height: 250,
                    borderRadius: 8,
                  }}
                  resizeMode="cover"
                />
                <View style={{ width: "48%" }}>
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
                      textAlign: "justify",
                      lineHeight: 20,
                    }}
                  >
                    {event.description}
                  </Text>
                </View>
              </View>
              {/* ESTADO + COMPARTIR (WEB) */}
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
                {/* Estado */}
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

                {/* Compartir */}
                <Pressable onPress={() => setShareVisible(true)}>
                  <Image
                    source={require("../assets/iconos/compartir.png")}
                    style={{ width: 26, height: 26, tintColor: "#014869" }}
                  />
                </Pressable>
              </View>

              {/* VALORACIONES - IGUAL A SEGUNDA IMAGEN */}
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
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                          borderBottomWidth: 0.5,
                          borderBottomColor: "#ddd",
                          paddingBottom: 4,
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
                    ))
                  ) : (
                    <Text style={{ color: "#777", fontStyle: "italic" }}>
                      Sin valoraciones aún.
                    </Text>
                  )}
                </ScrollView>
              </View>
            </>
          ) : (
            <>
              {/* Imagen */}
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
                {/* Estado */}
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

                {/* Compartir */}
                <Pressable onPress={() => setShareVisible(true)}>
                  <Image
                    source={require("../assets/iconos/compartir.png")}
                    style={{ width: 26, height: 26, tintColor: "#014869" }}
                  />
                </Pressable>
              </View>

              {/* Valoraciones */}
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

                {comments.length > 0 ? (
                  <ScrollView
                    nestedScrollEnabled={true}
                    style={{
                      maxHeight: 120,
                      backgroundColor: "#f9f9f9",
                      borderRadius: 8,
                      padding: 10,
                    }}
                  >
                    {comments.map((c, i) => (
                      <View
                        key={i}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                          borderBottomWidth: 0.5,
                          borderBottomColor: "#ddd",
                          paddingBottom: 4,
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
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={{ color: "#777", fontStyle: "italic" }}>
                    Sin valoraciones aún.
                  </Text>
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}

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

      {/* Footer */}
      {Platform.OS === "web" && (
        <Footer
          onAboutPress={goToAboutUs}
          onPrivacyPress={goToPrivacy}
          onConditionsPress={goToConditions}
        />
      )}
    </View>
  );
}
