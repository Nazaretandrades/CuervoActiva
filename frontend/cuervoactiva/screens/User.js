import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";
const API_URL = `${API_BASE}/api/events`;
const FAVORITES_URL = `${API_BASE}/api/favorites`;

export default function User() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("Usuario");
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // === Obtener token multiplataforma ===
  const getSessionToken = async () => {
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

  // === Obtener nombre del usuario logueado ===
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

  // === Cargar eventos y favoritos ===
  useEffect(() => {
    const loadData = async () => {
      try {
        await getUserName();
        const token = await getSessionToken();

        const resEvents = await fetch(API_URL);
        if (!resEvents.ok) throw new Error("Error al obtener eventos");
        const dataEvents = await resEvents.json();
        setEvents(dataEvents);
        setFiltered(dataEvents);

        if (token) {
          const resFav = await fetch(FAVORITES_URL, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resFav.ok) {
            const favs = await resFav.json();
            setFavorites(favs.map((f) => f._id));
          }
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        if (Platform.OS === "web")
          alert("❌ No se pudieron cargar los eventos o favoritos.");
        else Alert.alert("Error", "No se pudieron cargar los eventos.");
      }
    };
    loadData();
  }, []);

  // === Filtro ===
  useEffect(() => {
    let data = events;
    if (selectedCategory !== "all") {
      data = data.filter((e) => e.category === selectedCategory);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter(
        (e) =>
          e.title?.toLowerCase().includes(term) ||
          e.location?.toLowerCase().includes(term) ||
          e.category?.toLowerCase().includes(term)
      );
    }
    setFiltered(data);
  }, [search, selectedCategory, events]);

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

  // === Navegar al detalle del evento ===
  const goToEventDetail = (eventId) => {
    navigation.navigate("UserEventDetail", { eventId });
  };

  // === ✅ Nueva función: Navegar a notificaciones ===
  const goToNotifications = () => {
    navigation.navigate("UserNotifications");
  };

  // === Alternar favorito ===
  const toggleFavorite = async (eventId) => {
    try {
      const token = await getSessionToken();
      if (!token) {
        Alert.alert(
          "Inicia sesión",
          "Debes iniciar sesión para añadir favoritos."
        );
        return;
      }

      const isFav = favorites.includes(eventId);
      const method = isFav ? "DELETE" : "POST";

      const res = await fetch(`${FAVORITES_URL}/${eventId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al actualizar favoritos");

      setFavorites((prev) =>
        isFav ? prev.filter((id) => id !== eventId) : [...prev, eventId]
      );
    } catch (err) {
      console.error("Error al cambiar favorito:", err);
      Alert.alert("Error", "No se pudo actualizar el favorito.");
    }
  };

  // === Simulación navegación ===
  const simulateNavigation = (route) => {
    toggleMenu();
    Platform.OS === "web"
      ? alert(`Iría a: ${route}`)
      : Alert.alert("Navegación simulada", route);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons={true} />

      {/* ====== Barra superior ====== */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          justifyContent: "space-between",
        }}
      >
        <Text>👤 {userName}</Text>

        <TextInput
          placeholder="Buscar eventos..."
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

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* === 🔔 ICONO NOTIFICACIONES (nuevo) === */}
          <Pressable onPress={goToNotifications} style={{ marginHorizontal: 8 }}>
            <Image
              source={require("../assets/iconos/bell.png")}
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

      {/* ====== MENÚ ====== */}
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
              { label: "Ver favoritos", route: "Favoritos" },
              { label: "Contacto", route: "Contacto" },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => simulateNavigation(item.route)}
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
                },
                {
                  label: "Contacto",
                  icon: require("../assets/iconos/phone-usuario.png"),
                },
              ].map((item, index) => (
                <Pressable
                  key={index}
                  onPress={() => simulateNavigation(item.label)}
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

            {/* 🔸 Barra inferior */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: "#01486933",
                paddingVertical: 14,
              }}
            >
              <Image
                source={require("../assets/iconos/search.png")}
                style={{ width: 22, height: 22, tintColor: "#014869" }}
              />
              <Image
                source={require("../assets/iconos/calendar.png")}
                style={{ width: 22, height: 22, tintColor: "#014869" }}
              />
              <Image
                source={require("../assets/iconos/user.png")}
                style={{ width: 22, height: 22, tintColor: "#014869" }}
              />
            </View>
          </View>
        )
      )}

      {/* ====== Contenido principal ====== */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          paddingHorizontal: 16,
          gap: 16,
        }}
      >
        {/* Categorías */}
        <View style={{ width: "25%" }}>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Categorías
          </Text>

          {[
            { label: "Todos", value: "all", color: "#014869" },
            { label: "Deporte", value: "deporte", color: "#F3B23F" },
            { label: "Cultura e Historia", value: "cultura", color: "#784BA0" },
          ].map((cat, i) => (
            <Pressable
              key={i}
              onPress={() => setSelectedCategory(cat.value)}
              style={{
                backgroundColor:
                  selectedCategory === cat.value ? cat.color : `${cat.color}33`,
                paddingVertical: 10,
                borderRadius: 8,
                marginBottom: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: selectedCategory === cat.value ? "#fff" : "#014869",
                  fontWeight: "bold",
                }}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Eventos */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Listado de eventos
          </Text>

          <ScrollView>
            {filtered.length > 0 ? (
              filtered.map((ev) => {
                const isFav = favorites.includes(ev._id);
                return (
                  <Pressable
                    key={ev._id}
                    onPress={() => goToEventDetail(ev._id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                      padding: 10,
                      backgroundColor: "#f9f9f9",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: isFav ? "#014869" : "#ddd",
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        flex: 1,
                        color: isFav ? "#014869" : "#333",
                        fontWeight: isFav ? "bold" : "500",
                      }}
                    >
                      {ev.title}
                    </Text>

                    {/* Botón de favorito */}
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(ev._id);
                      }}
                      style={{
                        marginLeft: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: isFav ? "#014869" : "#E0E0E0",
                      }}
                    >
                      <Text
                        style={{
                          color: isFav ? "#fff" : "#555",
                          fontSize: 16,
                        }}
                      >
                        {isFav ? "★" : "☆"}
                      </Text>
                    </Pressable>
                  </Pressable>
                );
              })
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 40,
                  color: "#777",
                  fontStyle: "italic",
                }}
              >
                {search.trim()
                  ? "🔍 No se encontraron eventos."
                  : "📭 No hay eventos disponibles."}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>

      {Platform.OS === "web" && <Footer />}
    </View>
  );
}
