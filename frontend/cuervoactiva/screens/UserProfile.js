// frontend/src/screens/UserProfile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Alert,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🧠 Configurar API según la plataforma
const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000" // ⚠️ cambia esta IP por tu IPv4 local
    : "http://localhost:5000";

export default function UserProfile() {
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [userName, setUserName] = useState("Usuario");

  /** === Cargar usuario logueado === */
  useEffect(() => {
    const loadUser = async () => {
      try {
        let session;
        if (Platform.OS === "web") {
          session = JSON.parse(localStorage.getItem("USER_SESSION"));
        } else {
          const s = await AsyncStorage.getItem("USER_SESSION");
          session = s ? JSON.parse(s) : null;
        }

        if (session?.name && session?.email) {
          setForm({ name: session.name, email: session.email });
          setUserName(session.name);
        }
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };
    loadUser();
  }, []);

  /** === Guardar cambios en BD === */
  const handleSave = async () => {
    try {
      let session;
      if (Platform.OS === "web") {
        session = JSON.parse(localStorage.getItem("USER_SESSION"));
      } else {
        const s = await AsyncStorage.getItem("USER_SESSION");
        session = s ? JSON.parse(s) : null;
      }

      if (!session?.token) {
        Alert.alert("Error", "No se encontró la sesión del usuario.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar en la base de datos");

      const updatedUser = await res.json();

      const updatedSession = {
        ...session,
        name: updatedUser.name,
        email: updatedUser.email,
      };

      if (Platform.OS === "web") {
        localStorage.setItem("USER_SESSION", JSON.stringify(updatedSession));
      } else {
        await AsyncStorage.setItem(
          "USER_SESSION",
          JSON.stringify(updatedSession)
        );
      }

      Alert.alert("✅ Guardado", "Tu perfil ha sido actualizado correctamente.");
      setEditing(false);
      setUserName(updatedUser.name);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      Alert.alert("Error", err.message);
    }
  };

  /** === Cerrar sesión === */
  const handleLogout = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("USER_SESSION");
    } else {
      await AsyncStorage.removeItem("USER_SESSION");
    }
    navigation.navigate("Intro");
  };

  /** === Navegaciones === */
  const goToProfile = () => navigation.navigate("UserProfile");
  const goToNotifications = () => navigation.navigate("UserNotifications");
  const goToFavorites = () => navigation.navigate("UserFavorites");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToSearch = () => navigation.navigate("User");

  /** === Menú lateral === */
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

  /** === Menú móvil azul === */
  const renderMobileMenu = () =>
    menuVisible && (
      <View style={styles.mobileMenuContainer}>
        <View style={styles.headerBlue}>
          <Pressable onPress={toggleMenu}>
            <Image
              source={require("../assets/iconos/back-usuario.png")}
              style={styles.backIconBlue}
            />
          </Pressable>
          <Text style={styles.headerTitleBlue}>Menú</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.menuOptionsBlue}>
          {[
            {
              label: "Cultura e Historia",
              icon: require("../assets/iconos/museo-usuario.png"),
              action: goToCulturaHistoria,
            },
            {
              label: "Sobre nosotros",
              icon: require("../assets/iconos/info-usuario.png"),
              action: goToAboutUs,
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
          ].map((item, i) => (
            <Pressable key={i} onPress={item.action} style={styles.optionBlue}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={item.icon} style={styles.optionIconBlue} />
                <Text style={styles.optionTextBlue}>{item.label}</Text>
              </View>
              <Image
                source={require("../assets/iconos/siguiente.png")}
                style={styles.arrowIconBlue}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.bottomBarBlue}>
          <Pressable onPress={goToSearch}>
            <Image
              source={require("../assets/iconos/search.png")}
              style={styles.bottomIconBlue}
            />
          </Pressable>
          <Pressable onPress={goToCalendar}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={styles.bottomIconBlue}
            />
          </Pressable>
          <Pressable onPress={goToProfile}>
            <Image
              source={require("../assets/iconos/user.png")}
              style={styles.bottomIconBlue}
            />
          </Pressable>
        </View>
      </View>
    );

  /** === Render principal === */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* === Barra superior azul (Usuario) === */}
      <View style={styles.topBar}>
        <Text style={{ color: "#014869", fontWeight: "bold" }}>👤 {userName}</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={goToCalendar} style={{ marginRight: 10 }}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={styles.iconBlue}
            />
          </Pressable>

          <Pressable onPress={goToNotifications} style={{ marginRight: 10 }}>
            <Image
              source={require("../assets/iconos/bell.png")}
              style={styles.iconBlue}
            />
          </Pressable>

          <Pressable onPress={toggleMenu}>
            <Image
              source={
                menuVisible
                  ? require("../assets/iconos/close.png")
                  : require("../assets/iconos/menu-usuario.png")
              }
              style={styles.iconBlue}
            />
          </Pressable>
        </View>
      </View>

      {/* === Menú lateral === */}
      {Platform.OS === "web" ? (
        <>
          {menuVisible && (
            <TouchableWithoutFeedback onPress={toggleMenu}>
              <View style={styles.overlay} />
            </TouchableWithoutFeedback>
          )}
          <Animated.View
            style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}
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
                <Text style={{ color: "#014869", fontSize: 18, fontWeight: "700" }}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </>
      ) : (
        renderMobileMenu()
      )}

      {/* === Contenido principal === */}
      <View style={{ flex: 1, alignItems: "center", paddingTop: 30 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
          Perfil
        </Text>

        <Image
          source={require("../assets/iconos/user.png")}
          style={{
            width: 60,
            height: 60,
            tintColor: "#014869",
            marginBottom: 20,
          }}
        />

        <View style={{ width: "80%", maxWidth: 400 }}>
          <Text>Nombre:</Text>
          <TextInput
            editable={editing}
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
            style={styles.input}
          />

          <Text>Email:</Text>
          <TextInput
            editable={editing}
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            style={styles.input}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Pressable
              onPress={() => (editing ? handleSave() : setEditing(true))}
              style={styles.btnPrimary}
            >
              <Text style={{ color: "#fff" }}>
                {editing ? "Guardar" : "Editar"}
              </Text>
            </Pressable>

            <Pressable onPress={handleLogout} style={styles.btnLogout}>
              <Text style={{ color: "#fff" }}>Cerrar Sesión</Text>
            </Pressable>
          </View>
        </View>
      </View>

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

/** === Estilos === */
const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  iconBlue: { width: 26, height: 26, tintColor: "#014869" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 8,
    marginBottom: 15,
  },
  btnPrimary: {
    backgroundColor: "#014869",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  btnLogout: {
    backgroundColor: "#444",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
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

  // === Menú móvil azul ===
  mobileMenuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 100,
  },
  headerBlue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitleBlue: { fontSize: 18, fontWeight: "bold", color: "#014869" },
  backIconBlue: { width: 22, height: 22, tintColor: "#014869" },
  menuOptionsBlue: { flex: 1, paddingHorizontal: 40, gap: 30 },
  optionBlue: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionIconBlue: { width: 28, height: 28, tintColor: "#014869", marginRight: 12 },
  optionTextBlue: { color: "#014869", fontSize: 16, fontWeight: "600" },
  arrowIconBlue: { width: 16, height: 16, tintColor: "#014869" },
  bottomBarBlue: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#014869",
  },
  bottomIconBlue: { width: 26, height: 26, tintColor: "#014869" },
});
