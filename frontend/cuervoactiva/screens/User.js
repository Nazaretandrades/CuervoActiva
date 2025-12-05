// Pantalla Home del Usuario
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Animated,
  Platform,
  Alert,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

// Api según la plataforma
const API_BASE =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

// Api de los eventos
const API_URL = `${API_BASE}/api/events`;
// Api de los eventos favoritos
const FAVORITES_URL = `${API_BASE}/api/favorites`;

// Declaración del componente
export default function User() {
  // Estados
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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  /* Responsive */
  const [winWidth, setWinWidth] = useState(
    Platform.OS === "web" ? window.innerWidth : Dimensions.get("window").width
  );

  // Función para redimensionar en tiempo real
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Breakpoints
  const isWeb = Platform.OS === "web";
  const isMobileWeb = isWeb && winWidth < 768;
  const isTabletWeb = isWeb && winWidth >= 768 && winWidth < 1024;
  const isLaptopWeb = isWeb && winWidth >= 1024 && winWidth < 1440;
  const isLargeWeb = isWeb && winWidth >= 1440;
  const showFooterFixed = isLaptopWeb || isLargeWeb;
  const searchBarWidth = isWeb
    ? isMobileWeb
      ? "100%"
      : isTabletWeb
      ? 420
      : 700
    : "60%";
  const listMaxHeight = isMobileWeb ? 360 : isTabletWeb ? 400 : 500;
  const showTwoColumns = !isWeb ? true : !isMobileWeb;

  // Obtener la sesión y el token
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

  // Navegaciones
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

  // Obtener el nombre de usuario
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

  // Obtener todos los eventos y si hay token los favoritos
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

  // Filtrar los eventos según la categoría seleccionada
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

  // Menú
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

  // Agregar o Quitar favoritos
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

  /* Cabecera web */
  const renderTopBarWeb = () => (
    <View
      style={{
        flexDirection: isMobileWeb ? "column" : "row",
        alignItems: isMobileWeb ? "flex-start" : "center",
        gap: isMobileWeb ? 10 : 0,
        paddingHorizontal: 24,
        paddingVertical: 14,
        justifyContent: "space-between",
        backgroundColor: "#fff",
      }}
    >
      {/* Avatar + nombre */}
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

      {/* Buscador  */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#014869",
          borderRadius: 3,
          paddingHorizontal: 10,
          backgroundColor: "#fff",
          width: searchBarWidth,
          height: 36,
          marginHorizontal: isMobileWeb ? 0 : 16,
          marginTop: isMobileWeb ? 8 : 0,
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: isMobileWeb ? 8 : 0,
        }}
      >
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

  // Cabecera móvil
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

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 16 }}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: 24, height: 24, tintColor: "#014869" }}
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

  /* Menú web */
  const renderWebMenu = () =>
    Platform.OS === "web" &&
    menuVisible && (
      <>
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
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

  /* Menú móvil */
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

        {/* Bottom móvil */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderTopWidth: 2,
            borderTopColor: "#01486999",
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

  // Seleccionar categorías
  const getSelectedCategoryLabel = () => {
    const cats = [
      { label: "Todos", value: "all" },
      { label: "Deporte", value: "deporte" },
      { label: "Concurso y taller", value: "concurso" },
      { label: "Cultura e Historia", value: "cultura" },
      { label: "Arte y Música", value: "arte" },
    ];
    const found = cats.find((c) => c.value === selectedCategory);
    return found ? found.label : "Todos";
  };

  // Return
  return (
    <View style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}>
      <Header hideAuthButtons />
      {/* Header */}
      {Platform.OS === "web" ? renderTopBarWeb() : renderTopBarMobile()}
      {/* Menu web y móvil */}
      {renderWebMenu()}
      {renderMobileMenu()}

      {/* Cuerpo */}
      {Platform.OS === "web" ? (
        <ScrollView
          style={{ flex: 1, backgroundColor: "#f4f6f7" }}
          contentContainerStyle={{
            padding: 16,
            paddingTop: isMobileWeb
              ? 20
              : isLaptopWeb
              ? 40
              : isLargeWeb
              ? 20
              : 60,
            paddingBottom: showFooterFixed ? 110 : 40,
          }}
          showsVerticalScrollIndicator={true}
        >
          <View
            style={{
              flex: 1,
              flexDirection: showTwoColumns ? "row" : "column",
              justifyContent: "space-between",
            }}
          >
            {/* Categorías izquierda */}
            <View
              style={{
                width: showTwoColumns ? (isTabletWeb ? "35%" : "30%") : "100%",
                paddingRight: showTwoColumns ? 16 : 0,
                borderRightWidth: showTwoColumns ? 1 : 0,
                borderRightColor: "#e0e0e0",
                marginBottom: showTwoColumns ? 0 : 20,
                marginTop: isLaptopWeb ? -20 : isLargeWeb ? -10 : 0,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  marginBottom: 12,
                  color: "#014869",
                  fontSize: 16,
                }}
              >
                Categorías
              </Text>

              {/* Desplegable categorías en móvil web */}
              {isMobileWeb && (
                <View style={{ marginBottom: 16 }}>
                  <Pressable
                    onPress={() =>
                      setCategoryDropdownOpen((prevOpen) => !prevOpen)
                    }
                    style={{
                      borderWidth: 1,
                      borderColor: "#014869",
                      borderRadius: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      backgroundColor: "#fff",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          color: "#014869",
                          fontSize: 14,
                          fontWeight: "500",
                        }}
                      >
                        {getSelectedCategoryLabel()}
                      </Text>
                      <Text
                        style={{
                          color: "#014869",
                          fontSize: 14,
                          marginLeft: 8,
                        }}
                      >
                        {categoryDropdownOpen ? "▲" : "▼"}
                      </Text>
                    </View>
                  </Pressable>

                  {categoryDropdownOpen && (
                    <View
                      style={{
                        marginTop: 4,
                        borderWidth: 1,
                        borderColor: "#014869",
                        borderRadius: 6,
                        backgroundColor: "#fff",
                        overflow: "hidden",
                      }}
                    >
                      {[
                        { label: "Todos", value: "all" },
                        { label: "Deporte", value: "deporte" },
                        { label: "Concurso y taller", value: "concurso" },
                        { label: "Cultura e Historia", value: "cultura" },
                        { label: "Arte y Música", value: "arte" },
                      ].map((opt, idx) => (
                        <Pressable
                          key={idx}
                          onPress={() => {
                            setSelectedCategory(opt.value);
                            setCategoryDropdownOpen(false);
                          }}
                          style={{
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            backgroundColor:
                              selectedCategory === opt.value
                                ? "#e3f2fd"
                                : "#fff",
                            borderBottomWidth: idx === 4 ? 0 : 1,
                            borderBottomColor: "#eee",
                          }}
                        >
                          <Text
                            style={{
                              color: "#014869",
                              fontSize: 14,
                            }}
                          >
                            {opt.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              )}
              {/*Categorías en pantallas web menos en móvil web */}
              {!isMobileWeb &&
                [
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
                        hoveredCategory === cat.value
                          ? cat.color
                          : "transparent",
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
                      style={{
                        color: "#fff",
                        fontWeight: "600",
                        fontSize: 14,
                      }}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
            </View>

            {/* Listado eventos derecha */}
            <View
              style={{
                flex: 1,
                paddingHorizontal: showTwoColumns ? 16 : 0,
                marginTop: isLaptopWeb ? -30 : isLargeWeb ? -10 : 0,
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

              {/* Scroll del listado */}
              <ScrollView
                style={{
                  maxHeight: listMaxHeight,
                }}
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
                            style={{
                              width: 18,
                              height: 18,
                              tintColor: "#fff",
                            }}
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
        </ScrollView>
      ) : (
        /* Móvil nativo */
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 30,
            backgroundColor: "#f4f6f7",
          }}
          showsVerticalScrollIndicator={false}
        >
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
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

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
                        style={{
                          width: 18,
                          height: 18,
                          tintColor: "#fff",
                        }}
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

      {/* Footer responsive */}
      {Platform.OS === "web" && showFooterFixed && (
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
