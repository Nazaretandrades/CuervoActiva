import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Modal,
  Platform,
  Alert,
  Animated,
  TouchableWithoutFeedback,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";
const API_URL = `${API_BASE}/api/events`;
const COMMENTS_URL = `${API_BASE}/api/comments`;

export default function UserEventDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { eventId } = route.params || {};

  const [event, setEvent] = useState(null);
  const [rating, setRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);
  const [userName, setUserName] = useState("Usuario");

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // === Obtener token ===
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

  // === Obtener info usuario ===
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

  // === Cargar evento + comentarios ===
  useEffect(() => {
    const loadData = async () => {
      try {
        const resEvent = await fetch(`${API_URL}/${eventId}`);
        if (!resEvent.ok) throw new Error("Error al obtener evento");
        const dataEvent = await resEvent.json();
        setEvent(dataEvent);

        const userId = await getUserInfo();

        const resComments = await fetch(`${COMMENTS_URL}/${eventId}`);
        if (resComments.ok) {
          const dataComments = await resComments.json();

          if (dataComments.length > 0) {
            const avg =
              dataComments.reduce((acc, c) => acc + c.rating, 0) /
              dataComments.length;
            setAverageRating(avg);
          } else {
            setAverageRating(0);
          }

          const myComment = dataComments.find(
            (c) => c.user && c.user._id === userId
          );

          if (myComment) {
            setRating(myComment.rating);
            setHasRated(true);
          }
        }
      } catch (err) {
        console.error("Error cargando detalle:", err);
        Alert.alert("Error", "No se pudo cargar el detalle del evento");
      }
    };
    if (eventId) loadData();
  }, [eventId]);

  // === Valorar evento ===
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
      Alert.alert("✅", "Tu valoración se ha registrado correctamente");

      const resComments = await fetch(`${COMMENTS_URL}/${eventId}`);
      if (resComments.ok) {
        const dataComments = await resComments.json();
        const avg =
          dataComments.reduce((acc, c) => acc + c.rating, 0) /
          dataComments.length;
        setAverageRating(avg);
      }
    } catch (err) {
      console.error("Error al valorar:", err);
      Alert.alert("Error", "No se pudo registrar la valoración");
    }
  };

  // === Compartir ===
  const shareWhatsApp = () => {
    const msg = `¡Mira este evento! ${event.title} - ${event.location}`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "No se pudo abrir WhatsApp")
    );
  };

  const shareTwitter = () => {
    const msg = `¡Mira este evento! ${event.title} - ${event.location}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      msg
    )}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "No se pudo abrir Twitter")
    );
  };

  // === Menú lateral ===
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

  const goToNotifications = () => {
    navigation.navigate("UserNotifications");
  };

  const goToFavorites = () => {
    navigation.navigate("UserFavorites");
  };

  // === Renderizar estrellas ===
  const renderStars = () => {
    const stars = [];
    const displayRating = hasRated ? rating : averageRating;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Pressable key={i} onPress={() => handleRate(i)}>
          <Text
            style={{
              fontSize: 26,
              marginRight: 5,
              color: i <= displayRating ? "#014869" : "#ccc",
            }}
          >
            {i <= displayRating ? "★" : "☆"}
          </Text>
        </Pressable>
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };

  if (!event) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text>Cargando evento...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* === BARRA SUPERIOR === */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontWeight: "bold", color: "#014869" }}>
          👤 {userName}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={goToNotifications}
            style={{ marginHorizontal: 8 }}
          >
            <Image
              source={require("../assets/iconos/bell.png")}
              style={{ width: 26, height: 26, tintColor: "#014869" }}
            />
          </Pressable>

          <Pressable style={{ marginHorizontal: 8 }}>
            <Text>📅</Text>
          </Pressable>

          <Pressable onPress={toggleMenu}>
            <Image
              source={
                Platform.OS === "web" && menuVisible
                  ? require("../assets/iconos/close.png")
                  : require("../assets/iconos/menu-usuario.png")
              }
              style={{ width: 26, height: 26 }}
            />
          </Pressable>
        </View>
      </View>

      {/* === MENÚ === */}
      {Platform.OS === "web" ? (
        <>
          {menuVisible && (
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
          )}
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
              { label: "Perfil", route: "Perfil" },
              { label: "Sobre nosotros", route: "Sobre nosotros" },
              { label: "Cultura e Historia", route: "Cultura e Historia" },
              { label: "Ver favoritos", route: "UserFavorites" },
              { label: "Contacto", route: "Contacto" },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  toggleMenu();
                  navigation.navigate(item.route);
                }}
              >
                <Text
                  style={{
                    color: "#014869",
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 25,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </>
      ) : null}

      {/* === CONTENIDO PRINCIPAL === */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 10 }}
      >
        <View
          style={{
            backgroundColor: "#014869",
            paddingVertical: 10,
            paddingHorizontal: 15,
            marginBottom: 15,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            {event.title}
          </Text>
        </View>

        <Image
          source={{
            uri: event.image_url.startsWith("http")
              ? event.image_url.replace("localhost", "192.168.18.19")
              : `${API_BASE}${
                  event.image_url.startsWith("/") ? "" : "/"
                }${event.image_url.replace(/\\/g, "/")}`,
          }}
          style={{
            width: "100%",
            height: 220,
            borderRadius: 8,
            marginBottom: 12,
          }}
          resizeMode="cover"
        />

        <Text style={{ fontWeight: "bold", marginBottom: 6 }}>Descripción</Text>
        <Text style={{ marginBottom: 12 }}>{event.description}</Text>

        <View style={{ marginTop: 15, marginBottom: 20 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
            Valoración
          </Text>
          {renderStars()}
        </View>

        {/* === ESTADO DEL EVENTO === */}
        {/* === ESTADO DEL EVENTO === */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              backgroundColor:
                new Date(event.date) > new Date() ? "#2ECC71" : "#E74C3C",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              {new Date(event.date) > new Date()
                ? "Habilitado"
                : "Deshabilitado"}
            </Text>
          </View>
        </View>

        {/* === BOTÓN COMPARTIR === */}
        <View style={{ alignItems: "center", marginTop: 10 }}>
          <Pressable
            onPress={() => setShareVisible(true)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 8,
            }}
          >
            <Image
              source={require("../assets/iconos/compartir.png")}
              style={{ width: 22, height: 22, marginRight: 8 }}
            />
          </Pressable>
        </View>
      </ScrollView>

      {/* === MODAL COMPARTIR === */}
      <Modal
        visible={shareVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setShareVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 20,
              width: "80%",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                color: "#014869",
                marginBottom: 15,
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
                paddingVertical: 10,
                borderRadius: 8,
                width: "100%",
                alignItems: "center",
                marginBottom: 10,
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
                paddingVertical: 10,
                borderRadius: 8,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Twitter</Text>
            </Pressable>

            <Pressable
              onPress={() => setShareVisible(false)}
              style={{ marginTop: 15 }}
            >
              <Text style={{ color: "#014869", fontWeight: "bold" }}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {Platform.OS === "web" && <Footer />}
    </View>
  );
}
