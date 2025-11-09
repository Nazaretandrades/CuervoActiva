// frontend/src/screens/User.js
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
  const [hoveredCategory, setHoveredCategory] = useState(null);

  /** === Sesión === */
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
    } catch {
      return null;
    }
  };

  /** === Navegaciones === */
  const goToProfile = () => {
    if (Platform.OS !== "web") toggleMenu();
    navigation.navigate("UserProfile");
  };
  const goToAboutUs = () => {
    if (Platform.OS !== "web") toggleMenu();
    navigation.navigate("SobreNosotros");
  };
  const goToPrivacy = () => {
    if (Platform.OS !== "web") toggleMenu();
    navigation.navigate("PoliticaPrivacidad");
  };
  const goToConditions = () => {
    if (Platform.OS !== "web") toggleMenu();
    navigation.navigate("Condiciones");
  };
  const goToHome = () => {
    if (Platform.OS !== "web") toggleMenu();
    navigation.reset({
      index: 0,
      routes: [{ name: "User" }],
    });
  };
  const goToCulturaHistoria = () => {
    if (Platform.OS !== "web") toggleMenu();
    navigation.navigate("CulturaHistoria");
  };
  const goToContact = () => {
    if (Platform.OS !== "web") toggleMenu();
    navigation.navigate("Contacto");
  };
  const goToFavorites = () => {
    if (Platform.OS !== "web") toggleMenu();
    navigation.navigate("UserFavorites");
  };
  const goToNotifications = () => navigation.navigate("UserNotifications");
  const goToCalendar = () => navigation.navigate("Calendar");

  /** === Usuario === */
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

  /** === Cargar datos === */
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
        if (Platform.OS === "web")
          alert("❌ No se pudieron cargar los eventos o favoritos.");
        else Alert.alert("Error", "No se pudieron cargar los eventos.");
      }
    };
    loadData();
  }, []);

  /** === Filtro === */
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

  /** === Menú === */
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

  /** === Favoritos === */
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
    } catch {
      Alert.alert("Error", "No se pudo actualizar el favorito.");
    }
  };

  /** === Cabecera WEB (sin cambios) === */
  const renderTopBarWeb = () => (
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

      {/* Buscador */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#014869",
          borderRadius: 3,
          paddingHorizontal: 10,
          backgroundColor: "#fff",
          width: 700,
          height: 36,
          marginHorizontal: 16,
        }}
      >
        <TextInput
          placeholder="Buscar eventos..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#6b6f72"
          style={{
            flex: 1,
            color: "#014869",
            fontSize: 14,
            paddingVertical: 0,
          }}
        />
        <Image
          source={require("../assets/iconos/search.png")}
          style={{ width: 16, height: 16, tintColor: "#014869" }}
        />
      </View>

      {/* Iconos derecha */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: 22, height: 22, tintColor: "#014869" }}
          />
        </Pressable>

        <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/calendar.png")}
            style={{ width: 22, height: 22, tintColor: "#014869" }}
          />
        </Pressable>

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
  /** === Cabecera MÓVIL — igual que en web: icono, Usuario, nombre, notificaciones y menú === */
  const renderTopBarMobile = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#fff",
      }}
    >
      {/* Perfil Usuario */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            position: "relative",
            marginRight: 10,
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
        {/* 🔔 Notificaciones */}
        <Pressable onPress={goToNotifications} style={{ marginRight: 16 }}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: 24, height: 24, tintColor: "#014869" }}
          />
        </Pressable>

        {/* ☰ Menú */}
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

  /** === Menú lateral web === */
  /** === Menú lateral web (igual que Organizer.js) === */
  const renderWebMenu = () =>
    Platform.OS === "web" &&
    menuVisible && (
      <>
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
      </>
    );

  /** === Menú móvil (idéntico a tu ejemplo) === */
  const renderMobileMenu = () =>
    Platform.OS !== "web" &&
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

        {/* Opciones */}
        <View style={{ flex: 1 }}>
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
          ].map((item, index) => (
            <Pressable
              key={index}
              onPress={item.action}
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

        {/* Barra inferior */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderTopWidth: 2, // ← antes era 1
            borderTopColor: "#01486999", // un poco más visible
            paddingVertical: 14,
            backgroundColor: "#fff",
          }}
        >
          <Pressable onPress={goToHome}>
            <Image
              source={require("../assets/iconos/home-usuario.png")}
              style={{ width: 22, height: 22, tintColor: "#014869" }}
            />
          </Pressable>
          <Pressable onPress={goToCalendar}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={{ width: 22, height: 22, tintColor: "#014869" }}
            />
          </Pressable>
          <Pressable onPress={goToProfile}>
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 22, height: 22, tintColor: "#014869" }}
            />
          </Pressable>
        </View>
      </View>
    );

  /** === Render === */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}>
      <Header hideAuthButtons />
      {Platform.OS === "web" ? renderTopBarWeb() : renderTopBarMobile()}
      {renderWebMenu()}
      {renderMobileMenu()}

      {/* === CONTENIDO === */}
      {Platform.OS === "web" ? (
        /* ====================== WEB (SIN CAMBIOS) ====================== */
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            gap: 30,
            paddingVertical: 40,
            backgroundColor: "#f4f6f7",
            minHeight: "calc(100vh - 200px)",
          }}
        >
          {/* === CATEGORÍAS === */}
          <View
            style={{
              backgroundColor: "#f4f6f7",
              padding: 20,
              borderRadius: 10,
              width: 300,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 20,
                color: "#014869",
                fontSize: 16,
              }}
            >
              Categorías
            </Text>

            {[
              { label: "Todos", value: "all", color: "#b0bec5" },
              {
                label: "Deporte",
                value: "deporte",
                color: "#E67E22",
                icon: require("../assets/iconos/deporte.png"),
              },
              {
                label: "Concurso y taller",
                value: "concurso",
                color: "#F3B23F",
                icon: require("../assets/iconos/taller.png"),
              },
              {
                label: "Cultura e Historia",
                value: "cultura",
                color: "#784BA0",
                icon: require("../assets/iconos/museo-usuario.png"),
              },
              {
                label: "Arte y Música",
                value: "arte",
                color: "#2BBBAD",
                icon: require("../assets/iconos/arte.png"),
              },
            ].map((cat, i) => (
              <Pressable
                key={i}
                onPress={() => setSelectedCategory(cat.value)}
                onHoverIn={() => setHoveredCategory(cat.value)}
                onHoverOut={() => setHoveredCategory(null)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor:
                    hoveredCategory === cat.value
                      ? cat.color + "cc"
                      : cat.color,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  marginBottom: 15,
                  transform:
                    hoveredCategory === cat.value
                      ? [{ scale: 1.05 }]
                      : [{ scale: 1 }],
                  shadowColor:
                    hoveredCategory === cat.value ? cat.color : "transparent",
                  shadowOpacity: hoveredCategory === cat.value ? 0.4 : 0,
                  shadowRadius: hoveredCategory === cat.value ? 8 : 0,
                  transitionDuration: "200ms",
                  elevation: hoveredCategory === cat.value ? 4 : 0,
                }}
              >
                {cat.icon && (
                  <Image
                    source={cat.icon}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: "#fff",
                      marginRight: 10,
                    }}
                  />
                )}
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* === LISTADO DE EVENTOS === */}
          <View
            style={{
              backgroundColor: "#f4f6f7",
              padding: 20,
              borderRadius: 10,
              width: 650,
              flex: 1,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 20,
                color: "#014869",
                fontSize: 16,
              }}
            >
              Listado de eventos
            </Text>

            <ScrollView
              style={{ maxHeight: 600 }}
              showsVerticalScrollIndicator={true}
            >
              {filtered.length > 0 ? (
                filtered.map((ev) => {
                  const isFav = favorites.includes(ev._id);
                  const bgColor = isFav ? "#2BBBAD" : "#014869";
                  const iconColor = isFav ? "#2BBBAD" : "#014869";
                  return (
                    <View
                      key={ev._id}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14,
                      }}
                    >
                      <Pressable
                        onPress={() =>
                          navigation.navigate("UserEventDetail", {
                            eventId: ev._id,
                          })
                        }
                        style={{
                          flex: 1,
                          backgroundColor: bgColor,
                          paddingVertical: 14,
                          paddingHorizontal: 18,
                          borderRadius: 6,
                          marginRight: 10,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            color: "#fff",
                            fontWeight: "600",
                            fontSize: 15,
                          }}
                        >
                          {ev.title}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => toggleFavorite(ev._id)}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 6,
                          backgroundColor: iconColor,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={require("../assets/iconos/marcador.png")}
                          style={{ width: 18, height: 18, tintColor: "#fff" }}
                        />
                      </Pressable>
                    </View>
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
      ) : (
        /* ====================== MÓVIL (APP) ====================== */
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 30,
            backgroundColor: "#f4f6f7",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Categorías */}
          <View style={{ paddingTop: 16, paddingBottom: 10 }}>
            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 14,
                color: "#014869",
                fontSize: 16,
              }}
            >
              Categorías
            </Text>

            {[
              { label: "Todos", value: "all", color: "#b0bec5" },
              {
                label: "Deporte",
                value: "deporte",
                color: "#E67E22",
                icon: require("../assets/iconos/deporte.png"),
              },
              {
                label: "Concurso y taller",
                value: "concurso",
                color: "#F3B23F",
                icon: require("../assets/iconos/taller.png"),
              },
              {
                label: "Cultura e Historia",
                value: "cultura",
                color: "#784BA0",
                icon: require("../assets/iconos/museo-usuario.png"),
              },
              {
                label: "Arte y Música",
                value: "arte",
                color: "#2BBBAD",
                icon: require("../assets/iconos/arte.png"),
              },
            ].map((cat, i) => (
              <Pressable
                key={i}
                onPress={() => setSelectedCategory(cat.value)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: cat.color,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  marginBottom: 10,
                }}
              >
                {cat.icon && (
                  <Image
                    source={cat.icon}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: "#fff",
                      marginRight: 10,
                    }}
                  />
                )}
                <Text
                  style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Listado de eventos */}
          <View style={{ paddingTop: 6 }}>
            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 14,
                color: "#014869",
                fontSize: 16,
              }}
            >
              Listado de eventos
            </Text>

            {filtered.length > 0 ? (
              filtered.map((ev) => {
                const isFav = favorites.includes(ev._id);
                const bgColor = isFav ? "#2BBBAD" : "#014869";
                const iconColor = isFav ? "#2BBBAD" : "#014869";
                return (
                  <View
                    key={ev._id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Pressable
                      onPress={() =>
                        navigation.navigate("UserEventDetail", {
                          eventId: ev._id,
                        })
                      }
                      style={{
                        flex: 1,
                        backgroundColor: bgColor,
                        paddingVertical: 14,
                        paddingHorizontal: 18,
                        borderRadius: 6,
                        marginRight: 10,
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          color: "#fff",
                          fontWeight: "600",
                          fontSize: 15,
                        }}
                      >
                        {ev.title}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => toggleFavorite(ev._id)}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 6,
                        backgroundColor: iconColor,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        source={require("../assets/iconos/marcador.png")}
                        style={{ width: 18, height: 18, tintColor: "#fff" }}
                      />
                    </Pressable>
                  </View>
                );
              })
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  marginBottom: 40,
                  color: "#777",
                  fontStyle: "italic",
                }}
              >
                {search.trim()
                  ? "🔍 No se encontraron eventos."
                  : "📭 No hay eventos disponibles."}
              </Text>
            )}
          </View>
        </ScrollView>
      )}

      {/* === FOOTER FIJO EN WEB === */}
      {Platform.OS === "web" && (
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
