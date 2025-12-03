import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Modal,
  Platform,
  Animated,
  Alert,
  Linking,
  TextInput,
  Dimensions,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";

const API_BASE =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const API_URL = `${API_BASE}/api/events`;
const COMMENTS_URL = `${API_BASE}/api/comments`;

export default function UserEventDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params || {};

  const [event, setEvent] = useState(null);
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [shareVisible, setShareVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [userComment, setUserComment] = useState(null);

  /* ======================================================================
        RESPONSIVE WEB BREAKPOINTS
  ======================================================================= */
  const [winWidth, setWinWidth] = useState(
    Platform.OS === "web" ? window.innerWidth : Dimensions.get("window").width
  );

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const resize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const isWeb = Platform.OS === "web";
  const isTabletWeb = isWeb && winWidth >= 768 && winWidth < 1024;
  const isLaptopWeb = isWeb && winWidth >= 1024 && winWidth < 1440;
  const isDesktopWeb = isWeb && winWidth >= 1440;
  const showFooter = isLaptopWeb || isDesktopWeb;

  /* ====================================================================== */

  const getToken = async () => {
    try {
      if (Platform.OS === "web") {
        const session = JSON.parse(localStorage.getItem("USER_SESSION"));
        return session?.token || null;
      } else {
        const sessionString = await AsyncStorage.getItem("USER_SESSION");
        const session = sessionString ? JSON.parse(sessionString) : null;
        return session?.token || null;
      }
    } catch (err) {
      console.error("Error leyendo token:", err);
      return null;
    }
  };

  const getUserInfo = async () => {
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
      else if (session?.user?.username) setUserName(session.user.username);
      else if (session?.username) setUserName(session.username);
      else if (session?.user?.email)
        setUserName(session.user.email.split("@")[0]);
      else if (session?.email) setUserName(session.email.split("@")[0]);
      else setUserName("Invitado");

      return session?.user?._id || session?._id || null;
    } catch (err) {
      console.error("Error obteniendo usuario:", err);
      return null;
    }
  };

  const loadRatings = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${COMMENTS_URL}/user/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      setRating(data.userRating);
      setHasRated(true);
    } catch (err) {
      console.log("Error cargando valoración:", err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const resEvent = await fetch(`${API_URL}/${eventId}`);
        if (!resEvent.ok) throw new Error("Error al obtener evento");
        const dataEvent = await resEvent.json();
        setEvent(dataEvent);

        await getUserInfo();
        await loadRatings();
      } catch (err) {
        console.error("Error cargando detalle:", err);
        Alert.alert("Error", "No se pudo cargar el detalle del evento");
      }
    };

    if (eventId) loadData();
  }, [eventId]);

  const handleRate = async (value) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Debes iniciar sesión para valorar el evento");
        return;
      }

      setRating(value);
      const res = await fetch(`${COMMENTS_URL}/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: value }),
      });
      if (!res.ok) throw new Error("No se pudo enviar la valoración");

      setHasRated(true);
      await loadRatings();
      Alert.alert("✅", "Tu valoración se ha registrado correctamente");
    } catch (err) {
      console.error("Error al valorar:", err);
      Alert.alert("Error", "No se pudo registrar la valoración");
    }
  };

  const handleSendComment = async () => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "Debes iniciar sesión para comentar el evento");
        return;
      }

      if (!rating || rating <= 0) {
        Alert.alert("Error", "Debes valorar el evento antes de comentar.");
        return;
      }

      if (!commentText.trim()) {
        Alert.alert("Error", "El comentario no puede estar vacío.");
        return;
      }

      const res = await fetch(`${COMMENTS_URL}/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          text: commentText.trim(),
        }),
      });

      if (!res.ok) throw new Error("No se pudo enviar");

      const data = await res.json();
      setUserComment(data);
      setCommentText("");
      Alert.alert("✅", "Comentario enviado.");
    } catch (err) {
      console.error("Error al enviar comentario:", err);
      Alert.alert("Error", "No se pudo enviar el comentario.");
    }
  };

  const renderStars = (ratingValue, interactive = false) => {
    const stars = [];
    const displayRating = interactive ? rating : ratingValue;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Pressable
          key={i}
          onPress={interactive ? () => handleRate(i) : null}
          disabled={!interactive}
        >
          <Text
            style={{
              fontSize: 20,
              color: i <= displayRating ? "#014869" : "#ccc",
              marginRight: 3,
            }}
          >
            {i <= displayRating ? "★" : "☆"}
          </Text>
        </Pressable>
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

  const goToProfile = () => navigation.navigate("UserProfile");
  const goToNotifications = () => navigation.navigate("UserNotifications");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToFavorites = () => navigation.navigate("UserFavorites");
  const goToAbout = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToContact = () => navigation.navigate("Contacto");
  const goToHome = () => navigation.navigate("User");

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

  const renderTopBarWeb = () => (
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
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            position: "relative",
            marginRight: 12,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#014869",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/iconos/user.png")}
            style={{ width: 24, height: 24, tintColor: "#fff" }}
          />
        </View>

        <View>
          <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
            Usuario
          </Text>
          <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: 22, height: 22, tintColor: "#014869" }}
          />
        </Pressable>

        <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/calendar.png")}
            style={{ width: 22, height: 22, tintColor: "#014869" }}
          />
        </Pressable>

        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close.png")
                : require("../assets/iconos/menu-usuario.png")
            }
            style={{ width: 24, height: 24, tintColor: "#014869" }}
          />
        </Pressable>
      </View>
    </View>
  );

  const renderTopBarMobile = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#fff",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            position: "relative",
            marginRight: 10,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#014869",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/iconos/user.png")}
            style={{ width: 24, height: 24, tintColor: "#fff" }}
          />
        </View>
        <View>
          <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
            Usuario
          </Text>
          <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 16 }}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: 24, height: 24, tintColor: "#014869" }}
          />
        </Pressable>

        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close.png")
                : require("../assets/iconos/menu-usuario.png")
            }
            style={{ width: 26, height: 26, tintColor: "#014869" }}
          />
        </Pressable>
      </View>
    </View>
  );

  const renderWebMenu = () =>
    Platform.OS === "web" &&
    menuVisible && (
      <Animated.View
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 250,
          height: "100%",
          backgroundColor: "#f8f8f8",
          padding: 20,
          zIndex: 10,
          transform: [{ translateX: menuAnim }],
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
        }}
      >
        {[
          { label: "Perfil", action: goToProfile },
          { label: "Cultura e Historia", action: goToCulturaHistoria },
          { label: "Ver favoritos", action: goToFavorites },
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
                cursor: "pointer",
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </Animated.View>
    );

  const renderMobileMenu = () =>
    Platform.OS !== "web" &&
    menuVisible && (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#f4f6f7",
          zIndex: 20,
          paddingHorizontal: 24,
          paddingTop: 50,
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
              style={{ width: 22, height: 22, tintColor: "#014869" }}
            />
          </Pressable>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#014869",
              textAlign: "center",
              flex: 1,
              marginRight: 37,
            }}
          >
            Menú
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          {[
            {
              label: "Cultura e Historia",
              icon: require("../assets/iconos/museo-usuario.png"),
              action: goToCulturaHistoria,
            },
            {
              label: "Sobre nosotros",
              icon: require("../assets/iconos/info-usuario.png"),
              action: goToAbout,
            },
            {
              label: "Ver favoritos",
              icon: require("../assets/iconos/favs-usuario.png"),
              action: goToFavorites,
            },
            {
              label: "Contacto",
              icon: require("../assets/iconos/phone-usuario.png"),
              action: goToContact,
            },
          ].map((item, index) => (
            <Pressable
              key={index}
              onPress={item.action}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 25,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  source={item.icon}
                  style={{
                    width: 22,
                    height: 22,
                    tintColor: "#014869",
                    marginRight: 14,
                  }}
                />
                <Text
                  style={{
                    color: "#014869",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  {item.label}
                </Text>
              </View>
              <Image
                source={require("../assets/iconos/siguiente.png")}
                style={{ width: 18, height: 18, tintColor: "#014869" }}
              />
            </Pressable>
          ))}
        </View>

        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderTopWidth: 2,
            borderTopColor: "#01486999",
            paddingVertical: 14,
            backgroundColor: "#fff",
          }}
        >
          <Pressable onPress={goToHome}>
            <Image
              source={require("../assets/iconos/home-usuario.png")}
              style={{ width: 22, height: 22, tintColor: "#014869" }}
            />
          </Pressable>
          <Pressable onPress={goToCalendar}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={{ width: 22, height: 22, tintColor: "#014869" }}
            />
          </Pressable>
          <Pressable onPress={goToProfile}>
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 22, height: 22, tintColor: "#014869" }}
            />
          </Pressable>
        </View>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {Platform.OS === "web" ? renderTopBarWeb() : renderTopBarMobile()}
      {renderWebMenu()}
      {renderMobileMenu()}

      {event && (
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: "#f5f6f7",
            padding: 15,
            marginBottom: isLaptopWeb || isDesktopWeb ? 150 : 0,
          }}
          contentContainerStyle={{
            paddingBottom: isLaptopWeb || isDesktopWeb ? 50 : 40,
          }}
        >
          <View
            style={{
              backgroundColor: "#014869",
              paddingVertical: 10,
              paddingHorizontal: 15,
              marginBottom: 20,
              borderRadius: 3,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
              {event.title}
            </Text>
          </View>

          {Platform.OS === "web" ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 20,
                  alignItems: "flex-start",
                }}
              >
                <Image
                  source={{
                    uri:
                      Platform.OS === "android"
                        ? event.image_url
                            .replace("localhost", "10.0.2.2")
                            .replace(/\\/g, "/")
                        : event.image_url.replace(/\\/g, "/"),
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
                      lineHeight: 20,
                      textAlign: "justify",
                    }}
                  >
                    {event.description}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  marginTop: 30,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor:
                      new Date(event.date) > new Date() ? "#2ECC71" : "#E74C3C",
                    borderRadius: 25,
                    paddingVertical: 7,
                    paddingHorizontal: 18,
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

              <View
                style={{
                  marginTop: isTabletWeb ? 10 : 5,
                }}
              >
                <Text
                  style={{
                    color: "#014869",
                    fontWeight: "bold",
                    marginBottom: 1,
                    fontSize: 15,
                  }}
                >
                  Tu valoración
                </Text>

                {renderStars(rating, true)}

                {/* COMENTARIO EN WEB */}
                <View
                  style={{
                    marginTop: isTabletWeb ? 10 : 5,
                  }}
                >
                  <Text
                    style={{
                      color: "#014869",
                      fontWeight: "bold",
                      marginBottom: 6,
                      fontSize: 15,
                    }}
                  >
                    Tu comentario
                  </Text>

                  <View
                    style={{
                      flexDirection: isLaptopWeb ? "row" : "column",
                      alignItems: isLaptopWeb ? "flex-start" : "flex-end",
                      width: "100%",
                      gap: isLaptopWeb ? 10 : 0,
                    }}
                  >
                    <TextInput
                      value={commentText}
                      onChangeText={setCommentText}
                      placeholder="Escribe aquí tu opinión sobre el evento..."
                      placeholderTextColor="#777"
                      multiline
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: "#ddd",
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        minHeight: 70,
                        textAlignVertical: "top",
                        color: "#333",
                        fontSize: 14,
                        flex: isLaptopWeb ? 1 : 0,
                        width: isLaptopWeb ? "88%" : "100%",
                      }}
                    />

                    <Pressable
                      onPress={handleSendComment}
                      style={{
                        backgroundColor: "#014869",
                        borderRadius: 20,
                        paddingVertical: 8,
                        paddingHorizontal: 18,
                        marginTop: isLaptopWeb ? 0 : 10,
                        alignSelf: isLaptopWeb ? "center" : "flex-end",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        Enviar comentario
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <Image
                source={{
                  uri:
                    Platform.OS === "android"
                      ? event.image_url
                          .replace("localhost", "10.0.2.2")
                          .replace(/\\/g, "/")
                      : event.image_url.replace(/\\/g, "/"),
                }}
                style={{
                  width: "100%",
                  height: 250,
                  borderRadius: 8,
                  marginBottom: 20,
                }}
                resizeMode="cover"
              />

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
                  lineHeight: 20,
                  textAlign: "justify",
                }}
              >
                {event.description}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 20,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor:
                      new Date(event.date) > new Date() ? "#2ECC71" : "#E74C3C",
                    borderRadius: 25,
                    paddingVertical: 7,
                    paddingHorizontal: 18,
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

              <View style={{ marginTop: 30 }}>
                <Text
                  style={{
                    color: "#014869",
                    fontWeight: "bold",
                    marginBottom: 10,
                    fontSize: 15,
                  }}
                >
                  Tu valoración
                </Text>

                {renderStars(rating, true)}

                {/* COMENTARIO MÓVIL */}
                <View style={{ marginTop: 18 }}>
                  <Text
                    style={{
                      color: "#014869",
                      fontWeight: "bold",
                      marginBottom: 6,
                      fontSize: 15,
                    }}
                  >
                    Tu comentario
                  </Text>
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Escribe aquí tu opinión sobre el evento..."
                    placeholderTextColor="#777"
                    multiline
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#ddd",
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      minHeight: 70,
                      textAlignVertical: "top",
                      color: "#333",
                      fontSize: 14,
                    }}
                  />
                  <Pressable
                    onPress={handleSendComment}
                    style={{
                      marginTop: 10,
                      alignSelf: "flex-end",
                      backgroundColor: "#014869",
                      borderRadius: 20,
                      paddingVertical: 6,
                      paddingHorizontal: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: 13,
                      }}
                    >
                      Enviar comentario
                    </Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      )}

      {/* === MODAL COMPARTIR === */}
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

      {/* ==============================
          FOOTER — SOLO LAPTOP + DESKTOP
      =============================== */}
      {isWeb && showFooter && (
        <View style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
          <Footer
            onAboutPress={goToAbout}
            onPrivacyPress={goToPrivacy}
            onConditionsPress={goToConditions}
          />
        </View>
      )}
    </View>
  );
}
