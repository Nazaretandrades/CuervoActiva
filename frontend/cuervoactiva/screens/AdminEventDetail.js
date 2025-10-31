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
  Alert,
  Modal,
  Linking,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { getSession } from "../services/sessionManager";
import { useNavigation } from "@react-navigation/native"; // ✅ NUEVO: para redirigir

const API_BASE = "http://localhost:5000";
const API_URL = `${API_BASE}/api/events`;
const COMMENTS_URL = `${API_BASE}/api/comments`;

export default function AdminEventDetail({ route }) {
  const { eventId } = route?.params || {};
  const [event, setEvent] = useState(null);
  const [comments, setComments] = useState([]);
  const [adminName, setAdminName] = useState("Administrador");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [shareVisible, setShareVisible] = useState(false);

  const navigation = useNavigation(); // ✅ NUEVO: para poder navegar

  // === Obtener nombre del admin ===
  useEffect(() => {
    const loadAdmin = async () => {
      const session = await getSession();
      if (session?.name) setAdminName(session.name);
    };
    loadAdmin();
  }, []);

  // === Cargar evento + comentarios ===
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
        alert("Error al cargar evento o valoraciones.");
      }
    };
    if (eventId) loadEvent();
  }, [eventId]);

  // === Renderizar estrellas ===
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          style={{
            fontSize: 22,
            marginRight: 4,
            color: i <= rating ? "#014869" : "#ccc",
          }}
        >
          {i <= rating ? "★" : "☆"}
        </Text>
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
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

  // === Redirección a notificaciones === ✅ NUEVO
  const goToNotifications = () => {
    navigation.navigate("AdminNotifications");
  };

  // === Redirección del menú lateral === ✅ MODIFICADO
  const handleMenuPress = (item) => {
    toggleMenu();
    if (item.route) navigation.navigate(item.route);
    else alert(`Iría a: ${item.label}`);
  };

  // === Compartir ===
  const shareWhatsApp = () => {
    if (!event) return;
    const msg = `¡Mira este evento! ${event.title} - ${event.location}`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "No se pudo abrir WhatsApp")
    );
  };

  const shareTwitter = () => {
    if (!event) return;
    const msg = `¡Mira este evento! ${event.title} - ${event.location}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      msg
    )}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "No se pudo abrir Twitter")
    );
  };

  if (!event)
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Cargando evento...</Text>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* === BARRA SUPERIOR === */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        {/* 👑 Admin */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ marginRight: 6 }}>👑</Text>
          <Text>Admin. {adminName}</Text>
        </View>

        {/* 🔔 Notificaciones + Menú (NUEVO) */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={goToNotifications} style={{ marginRight: 10 }}>
            <Image
              source={require("../assets/iconos/bell2.png")}
              style={{ width: 22, height: 22 }}
            />
          </Pressable>

          <Pressable onPress={toggleMenu}>
            <Image
              source={
                menuVisible
                  ? require("../assets/iconos/close-admin.png")
                  : require("../assets/iconos/menu-admin.png")
              }
              style={{ width: 26, height: 26 }}
            />
          </Pressable>
        </View>
      </View>

      {/* === MENÚ LATERAL === */}
      {Platform.OS === "web" && (
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
              { label: "Perfil" },
              { label: "Sobre nosotros" },
              { label: "Cultura e Historia" },
              { label: "Ver usuarios", route: "AdminUsers" }, // ✅ NUEVO
              { label: "Contacto" },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => handleMenuPress(item)}
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

      {/* === CONTENIDO PRINCIPAL === */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 20 }}>
        {/* === Título === */}
        <View
          style={{
            backgroundColor: "#014869",
            paddingVertical: 10,
            paddingHorizontal: 15,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            {event.title}
          </Text>
        </View>

        {/* === Imagen === */}
        <Image
          source={{
            uri: event.image_url.startsWith("http")
              ? event.image_url
              : `${API_BASE}${
                  event.image_url.startsWith("/") ? "" : "/"
                }${event.image_url}`,
          }}
          style={{
            width: "100%",
            height: 220,
            borderRadius: 8,
            marginBottom: 15,
          }}
          resizeMode="cover"
        />

        {/* === Descripción === */}
        <Text style={{ fontWeight: "bold", color: "#014869", marginBottom: 6 }}>
          Descripción:
        </Text>
        <Text style={{ marginBottom: 16 }}>{event.description}</Text>

        {/* === Valoraciones === */}
        <Text style={{ fontWeight: "bold", color: "#014869", marginBottom: 8 }}>
          Valoraciones de usuarios:
        </Text>
        {comments.length > 0 ? (
          <ScrollView
            style={{
              maxHeight: 150,
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
                  marginBottom: 6,
                  borderBottomWidth: 0.5,
                  borderBottomColor: "#ddd",
                  paddingBottom: 4,
                }}
              >
                <Text style={{ color: "#014869", fontWeight: "600", flex: 1 }}>
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

        {/* === Estado === */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            marginTop: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#2ECC71",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Habilitado
            </Text>
          </View>
        </View>

        {/* === Botón compartir === */}
        <View style={{ alignItems: "center", marginTop: 20 }}>
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
              <Text style={{ color: "#fff", fontWeight: "bold" }}>WhatsApp</Text>
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

            <Pressable onPress={() => setShareVisible(false)} style={{ marginTop: 15 }}>
              <Text style={{ color: "#014869", fontWeight: "bold" }}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Footer />
    </View>
  );
}
