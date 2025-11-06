// frontend/src/screens/AdminEventDetail.js
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
import { useNavigation } from "@react-navigation/native";

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

  const navigation = useNavigation();

  // === Obtener sesión del administrador ===
  useEffect(() => {
    const loadAdmin = async () => {
      const session = await getSession();
      if (session?.name) setAdminName(session.name);
    };
    loadAdmin();
  }, []);

  // === Cargar evento y valoraciones ===
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
        Alert.alert("Error", "Error al cargar evento o valoraciones.");
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

  // === Navegaciones ===
  const goToProfile = () => navigation.navigate("AdminProfile");
  const goToUsers = () => navigation.navigate("AdminUsers");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToContact = () => navigation.navigate("Contacto");
  const goToNotifications = () => navigation.navigate("AdminNotifications");
  const goToAbout = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToCalendar = () => navigation.navigate("Calendar");

  // === Alternar menú lateral ===
  const toggleMenu = () => {
    if (Platform.OS !== "web") return;
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando evento...</Text>
      </View>
    );

  // === Render principal ===
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* === CABECERA SUPERIOR === */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: "#eee",
          zIndex: 1,
        }}
      >
        {/* 👑 Admin */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text>👑</Text>
          <Text>
            Admin. {adminName}
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Pressable onPress={goToCalendar}>
            <Image
              source={require("../assets/iconos/calendar-admin.png")}
              style={{ width: 26, height: 26 }}
            />
          </Pressable>

          <Pressable onPress={goToNotifications}>
            <Image
              source={require("../assets/iconos/bell2.png")}
              style={{ width: 26, height: 26 }}
            />
          </Pressable>

          <Pressable onPress={toggleMenu}>
            <Image
              source={
                Platform.OS === "web" && menuVisible
                  ? require("../assets/iconos/close-admin.png")
                  : require("../assets/iconos/menu-admin.png")
              }
              style={{ width: 26, height: 26 }}
            />
          </Pressable>
        </View>
      </View>

      {/* === MENÚ LATERAL (estilo moderno y fijo) === */}
      {Platform.OS === "web" && menuVisible && (
        <>
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.1)",
                zIndex: 9,
              }}
            />
          </TouchableWithoutFeedback>

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
              { label: "Ver usuarios", action: goToUsers },
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
        </>
      )}

      {/* === CONTENIDO PRINCIPAL === */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 20 }}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* === Título === */}
        <View
          style={{
            backgroundColor: "#014869",
            paddingVertical: 10,
            paddingHorizontal: 15,
            marginBottom: 20,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
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

      {/* === FOOTER FIJO === */}
      {Platform.OS === "web" && (
        <View
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: "#fff",
          }}
        >
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
