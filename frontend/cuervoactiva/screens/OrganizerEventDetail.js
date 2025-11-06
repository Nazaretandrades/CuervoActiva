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
  TextInput,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";
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
  const [search, setSearch] = useState("");

  const navigation = useNavigation();

  // === Obtener nombre del admin ===
  const getAdminName = async () => {
    try {
      let session;
      if (Platform.OS === "web") {
        session = JSON.parse(localStorage.getItem("USER_SESSION"));
      } else {
        const s = await AsyncStorage.getItem("USER_SESSION");
        session = s ? JSON.parse(s) : null;
      }

      if (session?.user?.name) {
        setAdminName(session.user.name);
      } else if (session?.name) {
        setAdminName(session.name);
      } else {
        setAdminName("Administrador");
      }
    } catch {
      setAdminName("Administrador");
    }
  };

  // === Cargar evento + comentarios ===
  useEffect(() => {
    const loadEvent = async () => {
      try {
        await getAdminName();

        const session =
          Platform.OS === "web"
            ? JSON.parse(localStorage.getItem("USER_SESSION"))
            : JSON.parse(await AsyncStorage.getItem("USER_SESSION"));
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

  // === Navegación ===
  const goToNotifications = () => navigation.navigate("AdminNotifications");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToProfile = () => navigation.navigate("OrganizerProfile");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToUsers = () => navigation.navigate("AdminUsers");
  const goToContact = () => navigation.navigate("Contacto");
  const goToAbout = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToSearch = () => navigation.navigate("Organizer");

  // === Menú lateral (web) ===
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

  // === Asegurar URL de imagen correcta ===
  const imageUrl =
    event.image_url?.startsWith("http") || event.image_url?.startsWith("file:")
      ? event.image_url
      : `${API_BASE}${event.image_url.startsWith("/") ? "" : "/"}${
          event.image_url || ""
        }`;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}>
      <Header hideAuthButtons />

      {/* === BARRA SUPERIOR === */}
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
        {/* Nombre admin */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text>👤</Text>
          <Text style={{ fontWeight: "600", color: "#014869" }}>
            {adminName}
          </Text>
        </View>

        {/* Buscador */}
        <TextInput
          placeholder="Buscar..."
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,
            marginHorizontal: 20,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 20,
            paddingHorizontal: 12,
            height: 36,
          }}
        />

        {/* Iconos */}
        <Pressable onPress={goToCalendar} style={{ marginRight: 14 }}>
          <Image
            source={require("../assets/iconos/calendar-organizador.png")}
            style={{ width: 26, height: 26 }}
          />
        </Pressable>

        <Pressable onPress={goToNotifications} style={{ marginRight: 10 }}>
          <Image
            source={require("../assets/iconos/bell3.png")}
            style={{ width: 26, height: 26 }}
          />
        </Pressable>

        <Pressable onPress={toggleMenu}>
          <Image
            source={
              Platform.OS === "web" && menuVisible
                ? require("../assets/iconos/close-organizador.png")
                : require("../assets/iconos/menu-organizador.png")
            }
            style={{ width: 26, height: 26 }}
          />
        </Pressable>
      </View>

      {/* === MENÚ WEB === */}
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
              { label: "Sobre Nosotros", action: goToAbout },
              { label: "Política de Privacidad", action: goToPrivacy },
              { label: "Condiciones de Uso", action: goToConditions },
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

      {/* === MENÚ MÓVIL === */}
      {Platform.OS !== "web" && menuVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fff",
            zIndex: 20,
            justifyContent: "space-between",
          }}
        >
          {/* CABECERA */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 50,
              paddingBottom: 20,
            }}
          >
            <Pressable onPress={toggleMenu}>
              <Image
                source={require("../assets/iconos/back-organizador.png")}
                style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
              />
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#F3B23F" }}>
              Menú
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* OPCIONES */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: 40,
              justifyContent: "flex-start",
              gap: 30,
            }}
          >
            {[
              {
                label: "Sobre nosotros",
                icon: require("../assets/iconos/info-usuario.png"),
                action: goToAbout,
              },
              {
                label: "Cultura e Historia",
                icon: require("../assets/iconos/museo-usuario.png"),
                action: goToCulturaHistoria,
              },
              {
                label: "Contacto",
                icon: require("../assets/iconos/phone-usuario.png"),
                action: goToContact,
              },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  toggleMenu();
                  item.action();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={item.icon}
                    style={{
                      width: 28,
                      height: 28,
                      tintColor: "#014869",
                      marginRight: 12,
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
                  style={{ width: 16, height: 16, tintColor: "#F3B23F" }}
                />
              </Pressable>
            ))}
          </View>

          {/* BARRA INFERIOR */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              paddingVertical: 10,
              borderTopWidth: 1,
              borderColor: "#F3B23F",
              backgroundColor: "#fff",
            }}
          >
            <Pressable onPress={goToSearch}>
              <Image
                source={require("../assets/iconos/search-organizador.png")}
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>

            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar-organizador.png")}
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>

            <Pressable onPress={goToProfile}>
              <Image
                source={require("../assets/iconos/user.png")}
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>
          </View>
        </View>
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

        {/* === Imagen corregida === */}
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: "100%",
              height: 220,
              borderRadius: 8,
              marginBottom: 15,
            }}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ color: "#777", textAlign: "center", marginBottom: 15 }}>
            Sin imagen disponible
          </Text>
        )}

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
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Habilitado</Text>
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

      {/* FOOTER WEB */}
      {Platform.OS === "web" && (
        <Footer
          onAboutPress={goToAbout}
          onPrivacyPress={goToPrivacy}
          onConditionsPress={goToConditions}
        />
      )}
    </View>
  );
}
