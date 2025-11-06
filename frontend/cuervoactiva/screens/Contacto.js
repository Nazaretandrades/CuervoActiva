// frontend/src/screens/Contacto.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as EmailJS from "@emailjs/browser"; // npm i @emailjs/browser
import { useNavigation } from "@react-navigation/native";
import OrganizerMenu from "./OrganizerMenu"; // ✅ Importamos menú organizador
import UserMenu from "./UserMenu"; // ✅ Importamos menú usuario

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";
const API_URL = `${API_BASE}/api/contact`;

// === Datos EmailJS ===
const EMAILJS_SERVICE_ID = "service_e2ogh6c";
const EMAILJS_TEMPLATE_ID = "template_uisdxgb";
const EMAILJS_PUBLIC_KEY = "tWyqaMDt1ylAxxUb1";

export default function Contacto({ navigation }) {
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    message: "",
  });
  const [role, setRole] = useState("user");
  const [userName, setUserName] = useState("Usuario");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [sending, setSending] = useState(false);
  const nav = useNavigation();

  // === Cargar sesión ===
  useEffect(() => {
    const loadSession = async () => {
      try {
        let session;
        if (Platform.OS === "web") {
          session = JSON.parse(localStorage.getItem("USER_SESSION"));
        } else {
          const s = await AsyncStorage.getItem("USER_SESSION");
          session = s ? JSON.parse(s) : null;
        }

        if (session?.user?.name) setUserName(session.user.name);
        else if (session?.name) setUserName(session.name);

        if (session?.user?.role) setRole(session.user.role);
        else if (session?.role) setRole(session.role);
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };
    loadSession();
  }, []);

  // === Validar formulario ===
  const validateForm = () => {
    const { name, lastname, email, phone, message } = form;
    if (!name.trim()) return Alert.alert("Error", "Por favor, escribe tu nombre.");
    if (!lastname.trim()) return Alert.alert("Error", "Por favor, escribe tus apellidos.");
    if (!email.trim()) return Alert.alert("Error", "Por favor, escribe tu correo electrónico.");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return Alert.alert("Error", "Correo electrónico no válido.");
    if (!phone.trim()) return Alert.alert("Error", "Por favor, escribe tu número de teléfono.");
    const phoneRegex = /^[0-9]{6,15}$/;
    if (!phoneRegex.test(phone.trim()))
      return Alert.alert("Error", "Introduce un número de teléfono válido.");
    if (!message.trim()) return Alert.alert("Error", "Por favor, escribe un mensaje.");
    return true;
  };

  // === Enviar ===
  const handleSend = async () => {
    if (!validateForm()) return;
    setSending(true);
    try {
      if (Platform.OS === "web") {
        EmailJS.init(EMAILJS_PUBLIC_KEY);
        const templateParams = {
          name: form.name,
          lastname: form.lastname,
          email: form.email,
          phone: form.phone,
          role,
          message: form.message,
        };
        await EmailJS.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams
        );
        Alert.alert("✅ Enviado", "Tu mensaje se ha enviado correctamente (EmailJS).");
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error en el servidor");
        Alert.alert("✅ Guardado", "Tu mensaje se ha registrado correctamente.");
      }
      setForm({ name: "", lastname: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Error al enviar contacto:", err);
      Alert.alert("❌ Error", "No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  // === Toggle Menú ===
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

  // === Navegaciones ===
  const goToProfile = () =>
    role === "admin"
      ? nav.navigate("AdminProfile")
      : role === "organizer"
      ? nav.navigate("OrganizerProfile")
      : nav.navigate("UserProfile");
  const goToNotifications = () =>
    role === "admin"
      ? nav.navigate("AdminNotifications")
      : role === "organizer"
      ? nav.navigate("OrganizerNotifications")
      : nav.navigate("UserNotifications");
  const goToCulturaHistoria = () => nav.navigate("CulturaHistoria");
  const goToCalendar = () => nav.navigate("Calendar");
  const goToUsers = () => nav.navigate("AdminUsers");
  const goToAbout = () => nav.navigate("SobreNosotros");
  const goToPrivacy = () => nav.navigate("PoliticaPrivacidad");
  const goToConditions = () => nav.navigate("Condiciones");
  const goToFavorites = () => nav.navigate("UserFavorites");

  // === Barra superior ===
  const renderTopBar = () => {
    // === ADMIN ===
    if (role === "admin") {
      return (
        <View style={styles.topBar}>
          <Text>👑 Admin. {userName}</Text>
          <View style={styles.topBarIcons}>
            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar-admin.png")}
                style={{ width: 26, height: 26, marginRight: 10 }}
              />
            </Pressable>
            <Pressable onPress={goToNotifications}>
              <Image
                source={require("../assets/iconos/bell2.png")}
                style={{ width: 24, height: 24, marginRight: 10 }}
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
      );
    }

    // === ORGANIZER ===
    if (role === "organizer") {
      return (
        <View style={styles.topBar}>
          <Text style={{ color: "#014869" }}>👤 {userName}</Text>
          <View style={styles.topBarIcons}>
            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar-organizador.png")}
                style={{
                  width: 26,
                  height: 26,
                  tintColor: "#F3B23F",
                  marginRight: 10,
                }}
              />
            </Pressable>
            <Pressable onPress={goToNotifications}>
              <Image
                source={require("../assets/iconos/bell3.png")}
                style={{
                  width: 24,
                  height: 24,
                  tintColor: "#F3B23F",
                  marginRight: 10,
                }}
              />
            </Pressable>
            <Pressable onPress={toggleMenu}>
              <Image
                source={
                  menuVisible
                    ? require("../assets/iconos/close-organizador.png")
                    : require("../assets/iconos/menu-organizador.png")
                }
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>
          </View>
        </View>
      );
    }

    // === USUARIO ===
    return (
      <View style={styles.topBar}>
        <Text>👤 {userName}</Text>
        <View style={styles.topBarIcons}>
          <Pressable onPress={goToCalendar}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={{
                width: 26,
                height: 26,
                tintColor: "#014869",
                marginRight: 10,
              }}
            />
          </Pressable>
          <Pressable onPress={goToNotifications}>
            <Image
              source={require("../assets/iconos/bell.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: "#014869",
                marginRight: 10,
              }}
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
  };

  // === Menú lateral (solo web) ===
  const renderMenu = () => {
    if (!menuVisible || Platform.OS !== "web") return null;

    let menuItems = [];
    if (role === "admin") {
      menuItems = [
        { label: "Perfil", action: goToProfile },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        { label: "Ver usuarios", action: goToUsers },
        { label: "Contacto" },
      ];
    } else if (role === "organizer") {
      menuItems = [
        { label: "Perfil", action: goToProfile },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        { label: "Contacto" },
      ];
    } else {
      menuItems = [
        { label: "Perfil", action: goToProfile },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        { label: "Ver favoritos", action: goToFavorites },
        { label: "Contacto" },
      ];
    }

    return (
      <>
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}
        >
          {menuItems.map((item, i) => (
            <Pressable
              key={i}
              onPress={() => {
                toggleMenu();
                if (item.action) item.action();
              }}
              style={{ marginBottom: 25 }}
            >
              <Text style={styles.menuItem}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </>
    );
  };

  // === Render principal ===
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {renderTopBar()}
      {renderMenu()}

      {/* === Menú móvil === */}
      {Platform.OS !== "web" && menuVisible && (
        role === "organizer" ? (
          <OrganizerMenu onClose={toggleMenu} />
        ) : (
          <UserMenu onClose={toggleMenu} />
        )
      )}

      {/* === FORMULARIO === */}
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          alignItems: "center",
          backgroundColor: "#f9f9f9",
          flexGrow: 1,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#014869",
            textAlign: "center",
            marginBottom: 30,
          }}
        >
          Contacto
        </Text>

        <View
          style={{
            backgroundColor: "#f2f2f2",
            borderRadius: 12,
            padding: 20,
            width: "100%",
            maxWidth: 900,
          }}
        >
          {/* Nombre y Apellidos */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#014869", fontWeight: "600" }}>Nombre:</Text>
              <TextInput
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  height: 36,
                  marginTop: 4,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#014869", fontWeight: "600" }}>Apellidos:</Text>
              <TextInput
                value={form.lastname}
                onChangeText={(t) => setForm({ ...form, lastname: t })}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  height: 36,
                  marginTop: 4,
                }}
              />
            </View>
          </View>

          {/* Email */}
          <Text style={{ color: "#014869", fontWeight: "600" }}>Email:</Text>
          <TextInput
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              paddingHorizontal: 12,
              height: 36,
              marginTop: 4,
              marginBottom: 10,
            }}
          />

          {/* Teléfono */}
          <Text style={{ color: "#014869", fontWeight: "600" }}>Teléfono:</Text>
          <TextInput
            value={form.phone}
            onChangeText={(t) => setForm({ ...form, phone: t })}
            keyboardType="phone-pad"
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              paddingHorizontal: 12,
              height: 36,
              marginTop: 4,
              marginBottom: 10,
            }}
          />

          {/* Mensaje */}
          <Text style={{ color: "#014869", fontWeight: "600" }}>Mensaje:</Text>
          <TextInput
            value={form.message}
            onChangeText={(t) => setForm({ ...form, message: t })}
            multiline
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 10,
              height: 100,
              marginTop: 4,
              textAlignVertical: "top",
            }}
          />

          {/* Botón */}
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Pressable
              onPress={handleSend}
              disabled={sending}
              style={{
                backgroundColor: "#F3B23F",
                borderRadius: 25,
                paddingVertical: 12,
                paddingHorizontal: 40,
                opacity: sending ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                {sending ? "Enviando..." : "Enviar mensaje"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
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

// === ESTILOS ===
const styles = {
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  topBarLeft: { flexDirection: "row", alignItems: "center" },
  topBarIcons: { flexDirection: "row", alignItems: "center" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 9,
  },
  sideMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 250,
    height: "100%",
    backgroundColor: "#f8f8f8",
    padding: 20,
    zIndex: 10,
  },
  menuItem: {
    color: "#014869",
    fontSize: 18,
    fontWeight: "700",
  },
};
