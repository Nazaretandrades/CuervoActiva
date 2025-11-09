// frontend/src/screens/UserFavorites.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Image,
  Animated,
  TouchableWithoutFeedback,
  Alert,
  TextInput,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";
const FAVORITES_URL = `${API_BASE}/api/favorites`;

export default function UserFavorites() {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("Usuario");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  /** === Obtener token multiplataforma === */
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
      console.error("Error leyendo sesión:", err);
      return null;
    }
  };

  /** === Obtener nombre del usuario === */
  const getUserName = async () => {
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
    } catch {
      setUserName("Invitado");
    }
  };

  /** === Cargar nombre del usuario === */
  useEffect(() => {
    getUserName();
  }, []);

  /** === Cargar favoritos === */
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(FAVORITES_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener favoritos");
        const data = await res.json();
        setFavorites(data);
        setFilteredFavorites(data);
      } catch (err) {
        console.error("Error cargando favoritos:", err);
        Alert.alert("Error", "No se pudieron cargar los favoritos.");
      }
    };
    loadFavorites();
  }, []);

  /** === 🔍 Filtro búsqueda === */
  useEffect(() => {
    if (!search.trim()) {
      setFilteredFavorites(favorites);
    } else {
      const term = search.toLowerCase();
      const filtered = favorites.filter(
        (fav) =>
          fav.title?.toLowerCase().includes(term) ||
          fav.location?.toLowerCase().includes(term) ||
          fav.category?.toLowerCase().includes(term)
      );
      setFilteredFavorites(filtered);
    }
  }, [search, favorites]);

  /** === Navegaciones === */
  const goToEventDetail = (eventId) =>
    navigation.navigate("UserEventDetail", { eventId });
  const goToNotifications = () => navigation.navigate("UserNotifications");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToProfile = () => navigation.navigate("UserProfile");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToContact = () => navigation.navigate("Contacto");
  const goToHome = () => navigation.navigate("User");

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

  /** === Cabecera móvil idéntica a UserProfile === */
  const renderTopBar = () => (
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
      {/* Perfil Usuario */}
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

      {/* Iconos derecha */}
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
              action: () => navigation.navigate("UserFavorites"),
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

        {/* 🔹 Barra inferior con iconos actualizados */}
        <View style={styles.bottomBarBlue}>
          <Pressable onPress={goToHome}>
            <Image
              source={require("../assets/iconos/home-usuario.png")}
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {renderTopBar()}

      {/* ======= MENÚ WEB (idéntico al de UserProfile) ======= */}
      {Platform.OS === "web" && menuVisible && (
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
            { label: "Ver favoritos", action: () => navigation.navigate("UserFavorites") },
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
      )}
      {Platform.OS !== "web" && renderMobileMenu()}

      {/* ======= Contenido principal ======= */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 20 }}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            color: "#014869",
            marginBottom: 20,
          }}
        >
          Favoritos
        </Text>

        <ScrollView>
          {filteredFavorites.length > 0 ? (
            filteredFavorites.map((fav) => (
              <Pressable
                key={fav._id}
                onPress={() => goToEventDetail(fav._id)}
                style={{
                  backgroundColor: "#014869",
                  borderRadius: 12,
                  paddingVertical: 12,
                  marginBottom: 14,
                  alignItems: "center",
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ color: "#fff", fontWeight: "bold" }}
                >
                  {fav.title}
                </Text>
              </Pressable>
            ))
          ) : (
            <Text style={{ textAlign: "center", color: "#777", marginTop: 40 }}>
              📭 No se encontraron eventos favoritos.
            </Text>
          )}
        </ScrollView>
      </View>

      {Platform.OS === "web" && <Footer />}
    </View>
  );
}

/** === Estilos === */
const styles = StyleSheet.create({
  iconBlue: { width: 26, height: 26, tintColor: "#014869" },
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
    elevation: 6,
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
  optionBlue: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionIconBlue: {
    width: 28,
    height: 28,
    tintColor: "#014869",
    marginRight: 12,
  },
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
