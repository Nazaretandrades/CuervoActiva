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
  const [filteredFavorites, setFilteredFavorites] = useState([]); // 🔍 NUEVO: lista filtrada
  const [search, setSearch] = useState(""); // 🔍 NUEVO: texto del buscador
  const [userName, setUserName] = useState("Usuario");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // === Obtener token multiplataforma ===
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

  // === Obtener usuario logueado ===
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
    } catch (err) {
      console.error("Error obteniendo usuario:", err);
      setUserName("Invitado");
    }
  };

  // === Cargar favoritos ===
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        await getUserName();
        const token = await getToken();
        if (!token) return;

        const res = await fetch(FAVORITES_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error al obtener favoritos");
        const data = await res.json();
        setFavorites(data);
        setFilteredFavorites(data); // inicializa el filtro
      } catch (err) {
        console.error("Error cargando favoritos:", err);
        if (Platform.OS === "web")
          alert("❌ No se pudieron cargar los favoritos.");
        else Alert.alert("Error", "No se pudieron cargar los favoritos.");
      }
    };
    loadFavorites();
  }, []);

  // === 🔍 Filtro de búsqueda ===
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

  // === Ir al detalle del evento ===
  const goToEventDetail = (eventId) => {
    navigation.navigate("UserEventDetail", { eventId });
  };

  // === ✅ Nueva función: Navegar a notificaciones ===
  const goToNotifications = () => {
    navigation.navigate("UserNotifications");
  };

  // === Alternar menú lateral ===
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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons={true} />

      {/* ======= Barra superior ======= */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          justifyContent: "space-between",
        }}
      >
        {/* 👤 Nombre del usuario */}
        <Text style={{ color: "#014869", fontWeight: "bold" }}>
          👤 {userName}
        </Text>

        {/* 🔍 Buscador de eventos favoritos */}
        <TextInput
          placeholder="Buscar favoritos..."
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,
            marginHorizontal: 16,
            borderWidth: 1,
            borderColor: "#ccc",
            paddingHorizontal: 8,
            height: 36,
            borderRadius: 6,
          }}
        />

        {/* 🔔 Iconos */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={goToNotifications} style={{ marginHorizontal: 8 }}>
            <Image source={require("../assets/iconos/bell.png")} />
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

      {/* ======= MENÚ lateral ======= */}
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
              elevation: 6,
              shadowOpacity: 0.3,
              shadowRadius: 8,
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
                style={{ marginBottom: 25 }}
              >
                <Text
                  style={{ color: "#014869", fontSize: 16, fontWeight: "600" }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </>
      ) : (
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
            {/* 🔙 Header */}
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

            {/* 🔹 Opciones */}
            <View style={{ flex: 1 }}>
              {[
                {
                  label: "Sobre nosotros",
                  icon: require("../assets/iconos/info-usuario.png"),
                },
                {
                  label: "Cultura e Historia",
                  icon: require("../assets/iconos/museo-usuario.png"),
                },
                {
                  label: "Ver favoritos",
                  icon: require("../assets/iconos/favs-usuario.png"),
                  route: "UserFavorites",
                },
                {
                  label: "Contacto",
                  icon: require("../assets/iconos/phone-usuario.png"),
                },
              ].map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    toggleMenu();
                    navigation.navigate(item.route);
                  }}
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
          </View>
        )
      )}

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
