// Pantalla del contacto
import React, { useEffect, useState, useRef } from "react";
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
  StyleSheet,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as EmailJS from "@emailjs/browser";
import { useNavigation } from "@react-navigation/native";
import OrganizerMenu from "./OrganizerMenu";
import UserMenu from "./UserMenu";
import Constants from "expo-constants";

const LOCAL_API =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const API_BASE =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || LOCAL_API;
const API_URL = `${API_BASE}/api/contact`;
// Claves de Email.js
const EMAILJS_SERVICE_ID = "service_e2ogh6c"; // identifica el servicio de EmailJS
const EMAILJS_TEMPLATE_ID = "template_uisdxgb"; // la plantilla del email que creé
const EMAILJS_PUBLIC_KEY = "tWyqaMDt1ylAxxUb1"; // la clave de cliente pública

// Declaro el componente
export default function Contacto() {
  //Estados
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
  const [toast, setToast] = useState({ visible: false, type: "", message: "" });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Mostrar el toast
  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast({ visible: false, type: "", message: "" }));
    }, 3000);
  };

  // Cargar la sesión
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

  // Validar el formulario
  const validateForm = () => {
    const { name, lastname, email, phone, message } = form;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{6,15}$/;
    if (!name.trim())
      return showToast("error", "Por favor, escribe tu nombre.");
    if (!lastname.trim())
      return showToast("error", "Por favor, escribe tus apellidos.");
    if (!email.trim() || !emailRegex.test(email.trim()))
      return showToast("error", "Correo electrónico no válido.");
    if (!phone.trim() || !phoneRegex.test(phone.trim()))
      return showToast("error", "Introduce un número de teléfono válido.");
    if (!message.trim())
      return showToast("error", "Por favor, escribe un mensaje.");
    return true;
  };

  // Función para mandar el formulario
  const handleSend = async () => {
    // Llamo a la función de validar los campos
    if (!validateForm()) return;
    // Estado de “enviando…”
    setSending(true);
    try {
      // Web
      if (Platform.OS === "web") {
        EmailJS.init(EMAILJS_PUBLIC_KEY);
        await EmailJS.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          ...form,
          role,
        });
        showToast("success", "✅ Tu mensaje se ha enviado correctamente.");
      } // Móvil
      else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error en el servidor");
        showToast("success", "✅ Tu mensaje se ha registrado correctamente.");
      }
      setForm({ name: "", lastname: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Error al enviar contacto:", err);
      showToast("error", "❌ No se pudo enviar el mensaje. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  };

  // Menu
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

  // Navegaciones
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
  const goToContact = () => nav.navigate("Contacto");

  // Cabecera del Usuario
  const renderUserTopBar = () => (
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

        {Platform.OS === "web" && (
          <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={{ width: 22, height: 22, tintColor: "#014869" }}
            />
          </Pressable>
        )}

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
  // Cabecera del Administrador
  const renderAdminTopBar = () => (
    <View style={styles.topBar}>
      <View style={styles.adminInfo}>
        <View style={styles.adminIconContainer}>
          <Image
            source={require("../assets/iconos/user.png")}
            style={styles.userIcon}
          />
          <Image
            source={require("../assets/iconos/corona.png")}
            style={styles.crownIcon}
          />
        </View>
        <View>
          <Text style={styles.adminTitle}>Admin.</Text>
          <Text style={styles.adminName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.iconRow}>
        <Pressable onPress={goToNotifications} style={styles.iconButton}>
          <Image
            source={require("../assets/iconos/bell2.png")}
            style={styles.topIcon}
          />
        </Pressable>
        <Pressable onPress={goToCalendar} style={styles.iconButton}>
          <Image
            source={require("../assets/iconos/calendar-admin.png")}
            style={styles.topIcon}
          />
        </Pressable>
        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close-admin.png")
                : require("../assets/iconos/menu-admin.png")
            }
            style={styles.topIcon}
          />
        </Pressable>
      </View>
    </View>
  );

  // Cabecera del Organizador
  const renderOrganizerTopBar = () =>
    role === "organizer" && (
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
                top: -4,
                left: -4,
                width: 22,
                height: 22,
                resizeMode: "contain",
                transform: [{ rotate: "-25deg" }],
              }}
            />
          </View>
          <View>
            <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
              Organiz.
            </Text>
            <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
            <Image
              source={require("../assets/iconos/bell3.png")}
              style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
            />
          </Pressable>

          {Platform.OS === "web" && (
            <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
              <Image
                source={require("../assets/iconos/calendar-organizador.png")}
                style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
              />
            </Pressable>
          )}

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
    );

  // Menu Administrador
  const renderAdminMenu = () =>
    Platform.OS === "web" &&
    menuVisible && (
      <>
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}
        >
          {[
            { label: "Perfil", action: goToProfile },
            { label: "Cultura e Historia", action: goToCulturaHistoria },
            { label: "Ver usuarios", action: goToUsers },
            { label: "Contacto", action: () => {} },
          ].map((item, i) => (
            <Pressable
              key={i}
              onPress={() => {
                toggleMenu();
                item.action();
              }}
              style={{ marginBottom: 25 }}
            >
              <Text style={styles.menuItem}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </>
    );

  // Menu Organizador web
  const renderOrganizerMenuWeb = () =>
    role === "organizer" &&
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

  // Menu Usuario web
  const renderUserMenuWeb = () =>
    role === "user" &&
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

  // UI
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {/**Cabecera según el rol */}
      {role === "admin"
        ? renderAdminTopBar()
        : role === "organizer"
        ? renderOrganizerTopBar()
        : renderUserTopBar()}

      {/**Menu según el rol */}
      {role === "admin"
        ? renderAdminMenu()
        : role === "organizer"
        ? renderOrganizerMenuWeb()
        : renderUserMenuWeb()}

      {/**Menu móvil según el rol */}
      {Platform.OS !== "web" &&
        menuVisible &&
        (role === "organizer" ? (
          <OrganizerMenu onClose={toggleMenu} />
        ) : (
          <UserMenu onClose={toggleMenu} />
        ))}

      {/**Contenido principal */}
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          alignItems: "center",
          backgroundColor: "#f9f9f9",
          flexGrow: 1,
        }}
      >
        {/**Titulo */}
        <Text style={styles.title}>Contacto</Text>

        {/**Formulario */}
        <View style={styles.formContainer}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              {/**Nombre */}
              <Text style={styles.label}>Nombre:</Text>
              <TextInput
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                style={styles.input}
              />
            </View>
            <View style={{ flex: 1 }}>
              {/**Apellidos */}
              <Text style={styles.label}>Apellidos:</Text>
              <TextInput
                value={form.lastname}
                onChangeText={(t) => setForm({ ...form, lastname: t })}
                style={styles.input}
              />
            </View>
          </View>

          {/**Email */}
          <Text style={styles.label}>Email:</Text>
          <TextInput
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          {/**Teléfono */}
          <Text style={styles.label}>Teléfono:</Text>
          <TextInput
            value={form.phone}
            onChangeText={(t) => setForm({ ...form, phone: t })}
            keyboardType="phone-pad"
            style={styles.input}
          />
          {/**Mensaje */}
          <Text style={styles.label}>Mensaje:</Text>
          <TextInput
            value={form.message}
            onChangeText={(t) => setForm({ ...form, message: t })}
            multiline
            style={styles.textarea}
          />

          {/**Botón de enviar */}
          <View style={{ alignItems: "center", marginTop: 20 }}>
            <Pressable
              onPress={handleSend}
              disabled={sending}
              style={[styles.sendButton, { opacity: sending ? 0.7 : 1 }]}
            >
              <Text style={styles.sendButtonText}>
                {sending ? "Enviando..." : "Enviar mensaje"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      {/**Toast */}
      {toast.visible && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 100,
            left: "5%",
            right: "5%",
            backgroundColor: toast.type === "success" ? "#4CAF50" : "#E74C3C",
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
            opacity: fadeAnim,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              textAlign: "center",
              fontSize: 15,
            }}
          >
            {toast.message}
          </Text>
        </Animated.View>
      )}

      {/**Footer */}
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

// Estilos
const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  adminInfo: { flexDirection: "row", alignItems: "center" },
  adminIconContainer: {
    position: "relative",
    marginRight: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0094A2",
    alignItems: "center",
    justifyContent: "center",
  },
  userIcon: { width: 24, height: 24, tintColor: "#fff" },
  crownIcon: {
    position: "absolute",
    top: -12,
    left: -6,
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  adminTitle: { color: "#014869", fontWeight: "700", fontSize: 14 },
  adminName: { color: "#6c757d", fontSize: 13 },
  iconRow: { flexDirection: "row", alignItems: "center" },
  iconButton: { marginRight: 20 },
  topIcon: { width: 22, height: 22, tintColor: "#0094A2" },
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
  menuItem: { color: "#014869", fontSize: 18, fontWeight: "700" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 9,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#014869",
    textAlign: "center",
    marginBottom: 30,
  },
  formContainer: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 900,
  },
  row: { flexDirection: "row", gap: 10, marginBottom: 10 },
  label: { color: "#014869", fontWeight: "600" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
    marginTop: 4,
    marginBottom: 10,
  },
  textarea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    height: 100,
    marginTop: 4,
    textAlignVertical: "top",
  },
  sendButton: {
    backgroundColor: "#F3B23F",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 40,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
