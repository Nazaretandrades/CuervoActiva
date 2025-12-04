import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Image,
  Animated,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

const API_BASE =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const FAVORITES_URL = `${API_BASE}/api/favorites`;

export default function UserFavorites() {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [userName, setUserName] = useState("Usuario");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  /* ================== RESPONSIVE BREAKPOINTS EXACTO COMO USERNOTIFICATIONS ================== */
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
  const isMobileWeb = isWeb && winWidth < 768;
  const isTabletWeb = isWeb && winWidth >= 768 && winWidth < 1024;
  const isLaptopWeb = isWeb && winWidth >= 1024 && winWidth < 1440;
  const isDesktopWeb = isWeb && winWidth >= 1440;
  const isLargeWeb = isLaptopWeb || isDesktopWeb;

  const pagePaddingHorizontal = isMobileWeb
    ? 20
    : isTabletWeb
    ? 40
    : isLaptopWeb
    ? 55
    : 80;

  const pagePaddingBottom = isLargeWeb ? 80 : 20;

  const favoritesContainerWidth = isMobileWeb
    ? "100%"
    : isTabletWeb
    ? "95%"
    : isLaptopWeb
    ? "85%"
    : "70%";

  /* ================== SESSION + USERNAME ================== */
  const getToken = async () => {
    try {
      if (Platform.OS === "web") {
        const session = JSON.parse(localStorage.getItem("USER_SESSION"));
        return session?.token || null;
      } else {
        const s = await AsyncStorage.getItem("USER_SESSION");
        const session = s ? JSON.parse(s) : null;
        return session?.token || null;
      }
    } catch {
      return null;
    }
  };

  const getUserName = async () => {
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

  useEffect(() => {
    getUserName();
  }, []);

  /* ================== LOAD FAVORITES ================== */
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
        Alert.alert("Error", "No se pudieron cargar los favoritos.");
      }
    };

    loadFavorites();
  }, []);

  /* ================== SEARCH FILTER ================== */
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

  /* ================== NAVIGATION ================== */
  const goToEventDetail = (eventId) =>
    navigation.navigate("UserEventDetail", { eventId });
  const goToNotifications = () => navigation.navigate("UserNotifications");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToProfile = () => navigation.navigate("UserProfile");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToContact = () => navigation.navigate("Contacto");
  const goToHome = () => navigation.navigate("User");

  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");

  /* ================== MENU ================== */
  const toggleMenu = () => {
    if (!isWeb) {
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

  /* ================== TOP BAR ================== */
  const renderTopBar = () => (
    <View style={styles.topBar}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={styles.profileIcon}>
          <Image
            source={require("../assets/iconos/user.png")}
            style={{ width: 24, height: 24, tintColor: "#fff" }}
          />
        </View>

        <View>
          <Text style={styles.topUserLabel}>Usuario</Text>
          <Text style={styles.topUserName}>{userName}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={styles.topIcon}
          />
        </Pressable>

        {isWeb && (
          <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={styles.topIcon}
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
            style={styles.topIcon}
          />
        </Pressable>
      </View>
    </View>
  );

  /* ================== MOBILE MENU ================== */
  const renderMobileMenu = () =>
    menuVisible && (
      <View style={styles.mobileMenuContainer}>
        <View style={styles.mobileMenuHeader}>
          <Pressable onPress={toggleMenu}>
            <Image
              source={require("../assets/iconos/back-usuario.png")}
              style={styles.mobileBackIcon}
            />
          </Pressable>

          <Text style={styles.mobileMenuTitle}>Menú</Text>

          <View style={{ width: 24 }} />
        </View>

        <View style={styles.mobileMenuOptions}>
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
            <Pressable
              key={i}
              onPress={item.action}
              style={styles.mobileOption}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={item.icon} style={styles.mobileOptionIcon} />
                <Text style={styles.mobileOptionText}>{item.label}</Text>
              </View>

              <Image
                source={require("../assets/iconos/siguiente.png")}
                style={styles.mobileArrowIcon}
              />
            </Pressable>
          ))}
        </View>

        <View style={styles.mobileBottomBar}>
          <Pressable onPress={goToHome}>
            <Image
              source={require("../assets/iconos/home-usuario.png")}
              style={styles.mobileBottomIcon}
            />
          </Pressable>

          <Pressable onPress={goToCalendar}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={styles.mobileBottomIcon}
            />
          </Pressable>

          <Pressable onPress={goToProfile}>
            <Image
              source={require("../assets/iconos/user.png")}
              style={styles.mobileBottomIcon}
            />
          </Pressable>
        </View>
      </View>
    );

  /* ================== RENDER ================== */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {renderTopBar()}

      {/* WEB SIDE MENU */}
      {isWeb && menuVisible && (
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
            {
              label: "Ver favoritos",
              action: () => navigation.navigate("UserFavorites"),
            },
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

      {!isWeb && renderMobileMenu()}

      {/* ================== CONTENT ================== */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: pagePaddingHorizontal,
          paddingTop: 10,
          paddingBottom: pagePaddingBottom,
          backgroundColor: "#f5f6f7",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#014869",
            marginBottom: 20,
            textAlign: "center",
            width: 200,
          }}
        >
          Favoritos
        </Text>

        <ScrollView
          style={{
            flex: 1,
            maxHeight: isWeb ? "65vh" : 500,
            width: 300,
          }}
          contentContainerStyle={{
            alignItems: "center",
            paddingBottom: 30,
          }}
        >
          {filteredFavorites.length > 0 ? (
            filteredFavorites.map((fav) => (
              <Pressable
                key={fav._id}
                onPress={() => goToEventDetail(fav._id)}
                style={{
                  backgroundColor: "#014869",
                  paddingVertical: 12,
                  borderRadius: 25,
                  marginBottom: 12,
                  alignItems: "center",
                  width: "100%",
                  cursor: "pointer",
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    textAlign: "center",
                  }}
                >
                  {fav.title}
                </Text>
              </Pressable>
            ))
          ) : (
            <Text style={{ color: "#777" }}>
              📭 No se encontraron eventos favoritos.
            </Text>
          )}
        </ScrollView>
      </View>

      {/* FOOTER SOLO EN WEB GRANDE */}
      {isWeb && isLargeWeb && (
        <View
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            zIndex: 100,
          }}
        >
          <Footer
            onAboutPress={goToAboutUs}
            onPrivacyPress={goToPrivacy}
            onConditionsPress={goToConditions}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  profileIcon: {
    position: "relative",
    marginRight: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#014869",
    alignItems: "center",
    justifyContent: "center",
  },
  topUserLabel: { color: "#014869", fontWeight: "700", fontSize: 14 },
  topUserName: { color: "#6c757d", fontSize: 13 },
  topIcon: { width: 22, height: 22, tintColor: "#014869" },

  /* MOBILE MENU */
  mobileMenuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    zIndex: 100,
  },
  mobileMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#f8f8f8",
  },
  mobileMenuTitle: { fontSize: 18, fontWeight: "bold", color: "#014869" },
  mobileBackIcon: { width: 22, height: 22, tintColor: "#014869" },
  mobileMenuOptions: {
    flex: 1,
    paddingHorizontal: 40,
    gap: 30,
    backgroundColor: "#f8f8f8",
  },
  mobileOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mobileOptionIcon: {
    width: 28,
    height: 28,
    tintColor: "#014869",
    marginRight: 12,
  },
  mobileOptionText: { color: "#014869", fontSize: 16, fontWeight: "600" },
  mobileArrowIcon: { width: 16, height: 16, tintColor: "#014869" },
  mobileBottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#014869",
  },
  mobileBottomIcon: { width: 26, height: 26, tintColor: "#014869" },
});
