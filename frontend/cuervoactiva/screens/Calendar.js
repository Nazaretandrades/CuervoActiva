// Pantalla Calendario
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  StyleSheet,
  Dimensions,
  ScrollView,
  Animated,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { useNavigation } from "@react-navigation/native";

// URL dinámica del backend (Render para producción / Local para desarrollo)
const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : Platform.OS === "web"
    ? "http://localhost:5000"
    : "http://192.168.18.19:5000"); 
const API_URL = `${API_BASE}/api/events`;

// Asocio las categorías con un color (Mismo que en el del Home)
const CATEGORY_COLORS = {
  all: "#014869",
  deporte: "#F3B23F",
  concurso: "#FFD43B",
  cultura: "#784BA0",
  arte: "#2BBBAD",
  fiestas: "#E67E22",
  default: "#014869",
};

// Defino los nombres de los meses
const monthNamesEs = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// Defino las iniciales de los días de la semana
const weekNamesShortEs = ["L", "M", "X", "J", "V", "S", "D"];

// Normaliza una fecha al inicio del día (00:00), para que las comparaciones de fechas no se vean afectadas
function atStartOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Función que se encarga de reconocer la fecha en diferentes formatos,
 * convertirlos en un objeto Date
 * y devolverlos normalizados.
 * Si la fecha no es válida devuelve null
 * */

function parseDDMMYYYY(str) {
  if (!str || typeof str !== "string") return null;

  // Formato ISO yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [y, m, d] = str.substring(0, 10).split("-").map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    if (!isNaN(date.getTime())) return atStartOfDay(date);
  }

  // Formato dd/mm/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split("/").map(Number);
    const date = new Date(yyyy, mm - 1, dd, 12, 0, 0);
    if (!isNaN(date.getTime())) return atStartOfDay(date);
  }

  return null;
}

/**Genero una clave de texto con formato yyyy-mm-dd para cada día. Esa clave me sirve como índice para agrupar eventos por día en un mapa */
function ymdKey(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Función que  “dibuja” la estructura del calendario
function getMonthMatrix(year, monthIndex) {
  // Calcula el primer día del mes y el último día
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();

  const matrix = [];
  let week = [];

  // Va metiendo new Date(year, monthIndex, day) en un array week
  for (let i = 0; i < firstWeekday; i++) week.push(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, monthIndex, day));
    // Cada 7 días, empuja una semana a matrix
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }

  // Si al final falta completar la última semana, rellena con null
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }

  return matrix;
}

// Pequeño componente reutilizable que pinta un círculo de color. Lo uso para indicar qué días tienen eventos y de qué tipo
function ColorDot({ color }) {
  return (
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color || "#ccc",
        marginHorizontal: 2,
      }}
    />
  );
}

// Declaro el componente
export default function Calendar() {
  // Estados
  const navigation = useNavigation();
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("Usuario");
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedKey, setSelectedKey] = useState(null);
  const [detailPanelVisible, setDetailPanelVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // Responsive
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width
  );
  const isWeb = Platform.OS === "web";

  // Breakpoints
  const isMobileWeb = isWeb && windowWidth < 600;
  const isTabletWeb = isWeb && windowWidth >= 600 && windowWidth < 900;
  const isLaptopWeb = isWeb && windowWidth >= 900 && windowWidth < 1400;
  const isDesktopWeb = isWeb && windowWidth >= 1400;

  // Función para redimensionar en tiempo real
  useEffect(() => {
    if (Platform.OS === "web") {
      const onResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, []);

  // Obtener la sesión
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session =
          Platform.OS === "web"
            ? JSON.parse(localStorage.getItem("USER_SESSION"))
            : JSON.parse(await AsyncStorage.getItem("USER_SESSION"));

        if (session?.user?.name || session?.name)
          setUserName(session.user?.name || session.name);

        if (session?.user?.role || session?.role)
          setRole(session.user?.role || session.role);
        else setRole("user");
      } catch {
        setRole("user");
        setUserName("Usuario");
      }
    };
    loadSession();
  }, []);

  // Cargar y normalizar eventos
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("No se pudieron obtener los eventos");

        const data = await res.json();

        const normalized = (data || []).map((ev) => {
          const d = parseDDMMYYYY(ev.date);
          const cat = (ev.category || "").toLowerCase();
          const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;

          return { ...ev, _date: d, _key: d ? ymdKey(d) : null, _color: color };
        });

        setEvents(normalized);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // Agrupar eventos por día
  // Uso useMemo para construir un mapa donde cada clave es un día (yyyy-mm-dd)
  const eventsByDay = useMemo(() => {
    const map = {};
    for (const ev of events) {
      if (!ev._key) continue;
      if (!map[ev._key]) map[ev._key] = [];
      map[ev._key].push(ev);
    }
    return map;
  }, [events]);

  // Matriz del mes y navegación entre meses
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const matrix = useMemo(
    () => getMonthMatrix(year, monthIndex),
    [year, monthIndex]
  );
  const goPrevMonth = () => setCurrentDate(new Date(year, monthIndex - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(year, monthIndex + 1, 1));

  // Selección de día y eventos seleccionados
  /**Cuando el usuario pulsa un día, guardo la clave de ese día en selectedKey y muestro el panel de detalle.
   * A partir de esa clave recupero los eventos de ese día del mapa eventsByDay
   */
  const handleSelectDay = (key) => {
    if (!key) return;
    setSelectedKey(key);
    setDetailPanelVisible(true);
  };

  const selectedEvents = selectedKey ? eventsByDay[selectedKey] || [] : [];

  // Navegaciones
  const goToProfile = () =>
    role === "admin"
      ? navigation.navigate("AdminProfile")
      : role === "organizer"
      ? navigation.navigate("OrganizerProfile")
      : navigation.navigate("UserProfile");

  const goToNotifications = () =>
    role === "admin"
      ? navigation.navigate("AdminNotifications")
      : role === "organizer"
      ? navigation.navigate("OrganizerNotifications")
      : navigation.navigate("UserNotifications");

  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToContact = () => navigation.navigate("Contacto");
  const goToAbout = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToUsers = () => navigation.navigate("AdminUsers");

  const goToFavorites = () => {
    if (Platform.OS !== "web") toggleMenu();
    navigation.navigate("UserFavorites");
  };

  const toggleMenu = () => {
    if (Platform.OS !== "web") {
      setMenuVisible((prev) => !prev);
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

  // Cabecera según el rol
  const renderTopBar = () => {
    const tint =
      role === "organizer"
        ? "#F3B23F"
        : role === "admin"
        ? "#0094A2"
        : "#014869";

    const avatarBg = tint;

    const bellIcon =
      role === "organizer"
        ? require("../assets/iconos/bell3.png")
        : role === "admin"
        ? require("../assets/iconos/bell2.png")
        : require("../assets/iconos/bell.png");

    const calIcon =
      role === "organizer"
        ? require("../assets/iconos/calendar-organizador.png")
        : role === "admin"
        ? require("../assets/iconos/calendar-admin.png")
        : require("../assets/iconos/calendar.png");

    let userBadge = null;
    if (role === "admin") userBadge = require("../assets/iconos/corona.png");
    else if (role === "organizer")
      userBadge = require("../assets/iconos/lapiz.png");

    const userBadgeStyle =
      role === "admin"
        ? {
            position: "absolute",
            top: -6,
            left: -6,
            width: 20,
            height: 20,
            resizeMode: "contain",
          }
        : {
            position: "absolute",
            top: -6,
            left: -6,
            width: 20,
            height: 20,
            resizeMode: "contain",
            transform: [{ rotate: "-20deg" }],
          };

    return (
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
        {/* Avatar + nombre */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              position: "relative",
              marginRight: 12,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: avatarBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 24, height: 24, tintColor: "#fff" }}
            />

            {userBadge && <Image source={userBadge} style={userBadgeStyle} />}
          </View>

          <View>
            <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
              {role === "admin"
                ? "Admin."
                : role === "organizer"
                ? "Organiz."
                : "Usuario"}
            </Text>
            <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
          </View>
        </View>

        {/* Iconos */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
            <Image
              source={bellIcon}
              style={{ width: 22, height: 22, tintColor: tint }}
            />
          </Pressable>

          {Platform.OS === "web" && (
            <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
              <Image
                source={calIcon}
                style={{ width: 22, height: 22, tintColor: tint }}
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
              style={{ width: 24, height: 24, tintColor: tint }}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  // Ancho controlado para el calendario en web
  const gridMaxWidth = isWeb
    ? isMobileWeb
      ? Math.min(windowWidth * 0.92, 420)
      : Math.min(windowWidth - 80, 680)
    : Math.min(Dimensions.get("window").width - 24, 720);

  // Return
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {/* Cabecera */}
      {renderTopBar()}

      {/* Menú lateral web */}
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
          {(role === "user"
            ? [
                { label: "Perfil", action: goToProfile },
                { label: "Cultura e Historia", action: goToCulturaHistoria },
                { label: "Ver favoritos", action: goToFavorites },
                { label: "Contacto", action: goToContact },
              ]
            : role === "admin"
            ? [
                { label: "Perfil", action: goToProfile },
                { label: "Cultura e Historia", action: goToCulturaHistoria },
                { label: "Ver usuarios", action: goToUsers },
                { label: "Contacto", action: goToContact },
              ]
            : [
                { label: "Perfil", action: goToProfile },
                { label: "Cultura e Historia", action: goToCulturaHistoria },
                { label: "Contacto", action: goToContact },
              ]
          ).map((item, i) => (
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

      {/* Menú móvil nativo */}
      {Platform.OS !== "web" &&
        menuVisible &&
        (role === "organizer" ? (
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
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#F3B23F",
                }}
              >
                Menú
              </Text>
              <View style={{ width: 24 }} />
            </View>

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
                    style={{
                      width: 16,
                      height: 16,
                      tintColor: "#F3B23F",
                    }}
                  />
                </Pressable>
              ))}
            </View>

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
              <Pressable
                onPress={() => {
                  const currentRoute =
                    navigation.getState().routes.slice(-1)[0].name ||
                    "Organizer";

                  if (currentRoute === "Organizer") {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "Organizer" }],
                    });
                  } else {
                    navigation.navigate("Organizer");
                  }
                }}
              >
                <Image
                  source={require("../assets/iconos/home-organizador.png")}
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
        ) : (
          <View style={styles.mobileMenu}>
            <View style={styles.mobileMenuHeader}>
              <Pressable onPress={toggleMenu}>
                <Image
                  source={require("../assets/iconos/back-usuario.png")}
                  style={{ width: 22, height: 22 }}
                />
              </Pressable>

              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: "#014869" }}
              >
                Menú
              </Text>

              <View style={{ width: 24 }} />
            </View>

            <View style={styles.mobileMenuBody}>
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
                <Pressable
                  key={i}
                  onPress={() => {
                    toggleMenu();
                    item.action();
                  }}
                  style={styles.mobileMenuItem}
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
                    <Text style={styles.mobileMenuText}>{item.label}</Text>
                  </View>

                  <Image
                    source={require("../assets/iconos/siguiente.png")}
                    style={{ width: 16, height: 16 }}
                  />
                </Pressable>
              ))}
            </View>

            <View style={styles.mobileBottomBar}>
              <Pressable
                onPress={() => {
                  const currentRoute =
                    navigation.getState().routes.slice(-1)[0].name || "User";

                  if (currentRoute === "User") {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: "User" }],
                    });
                  } else {
                    navigation.navigate("User");
                  }
                }}
              >
                <Image
                  source={require("../assets/iconos/home-usuario.png")}
                  style={{ width: 26, height: 26 }}
                />
              </Pressable>

              <Pressable onPress={goToCalendar}>
                <Image
                  source={require("../assets/iconos/calendar.png")}
                  style={{ width: 26, height: 26 }}
                />
              </Pressable>

              <Pressable onPress={goToProfile}>
                <Image
                  source={require("../assets/iconos/usuario.png")}
                  style={{ width: 26, height: 26 }}
                />
              </Pressable>
            </View>
          </View>
        ))}
      <ScrollView
        style={{
          minHeight: isMobileWeb
            ? "auto"
            : isLaptopWeb || isDesktopWeb
            ? "calc(100vh - 220px)"
            : "auto",
        }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          backgroundColor: "#f5f6f7",
          paddingTop: Platform.OS === "web" ? (isMobileWeb ? 100 : 20) : 100,

          paddingBottom:
            Platform.OS === "web"
              ? isLaptopWeb || isDesktopWeb
                ? 160
                : 80
              : 40,
        }}
      >
        {/**Cabecera del calendario */}
        <View style={[styles.headerRow, { width: gridMaxWidth }]}>
          <Pressable onPress={goPrevMonth} style={styles.navBtn}>
            <Text style={styles.navBtnText}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>
            {monthNamesEs[monthIndex]} {year}
          </Text>
          <Pressable onPress={goNextMonth} style={styles.navBtn}>
            <Text style={styles.navBtnText}>›</Text>
          </Pressable>
        </View>

        {/**Fila de los días de la semana, que recorre la lista */}
        <View style={[styles.weekHeader, { width: gridMaxWidth }]}>
          {weekNamesShortEs.map((d) => (
            <Text key={d} style={styles.weekHeaderText}>
              {d}
            </Text>
          ))}
        </View>

        {/** Cuerpo del calendario */}
        <View style={[styles.calendarGrid, { width: gridMaxWidth }]}>
          {/**Recorrer las semanas */}
          {matrix.map((week, r) => (
            <View key={r} style={styles.weekRow}>
              {/**Recorrer los días dentro de cada semana */}
              {week.map((date, c) => {
                const key = date ? ymdKey(date) : null;
                const day = date ? date.getDate() : "";
                const todayKey = ymdKey(atStartOfDay(new Date()));
                const isToday = key && key === todayKey;
                const dayEvents = key ? eventsByDay[key] || [] : [];
                return (
                  // Renderizar cada celda del calendario
                  <Pressable
                    key={`${r}-${c}`}
                    onPress={() => handleSelectDay(key)}
                    disabled={!date}
                    style={[
                      styles.dayCell,
                      isWeb && !isMobileWeb && styles.dayCellWeb,
                      !date && styles.dayCellEmpty,
                      isToday && styles.todayCell,
                      selectedKey === key && styles.selectedCell,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        !date && { color: "transparent" },
                        isToday && styles.todayNumber,
                      ]}
                    >
                      {day}
                    </Text>
                    {/**Mostrar puntos de colores según eventos */}
                    {!!dayEvents.length && (
                      <View style={styles.dotsRow}>
                        {dayEvents.slice(0, 3).map((ev, i) => (
                          <ColorDot key={i} color={ev._color} />
                        ))}
                        {dayEvents.length > 3 && (
                          <Text style={styles.moreDots}>
                            +{dayEvents.length - 3}
                          </Text>
                        )}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Detalle del día como modal */}
        {Platform.OS === "web" ? (
          <Modal
            animationType="fade"
            transparent
            visible={detailPanelVisible && selectedEvents.length > 0}
            onRequestClose={() => setDetailPanelVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.webModalBackdrop}
              onPress={() => setDetailPanelVisible(false)}
            >
              <View style={styles.webModalContent}>
                <Text style={styles.detailDateTitle}>
                  {renderDateTitle(selectedKey)}
                </Text>
                <ScrollView
                  style={{ maxHeight: 260, width: "100%" }}
                  contentContainerStyle={{ paddingVertical: 4 }}
                >
                  {selectedEvents.map((ev) => (
                    <View key={ev._id} style={styles.detailItem}>
                      <View
                        style={[
                          styles.detailBadge,
                          { backgroundColor: ev._color },
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detailTitle} numberOfLines={2}>
                          {ev.title}
                        </Text>
                        <Text style={styles.detailSub}>
                          {ev.hour
                            ? `${ev.hour} · ${labelFromCategory(ev.category)}`
                            : labelFromCategory(ev.category)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <Pressable
                  onPress={() => setDetailPanelVisible(false)}
                  style={styles.closeDetailBtn}
                >
                  <Text style={styles.closeDetailText}>Cerrar</Text>
                </Pressable>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <Modal
            animationType="slide"
            transparent
            visible={detailPanelVisible && selectedEvents.length > 0}
            onRequestClose={() => setDetailPanelVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalBackdrop}
              onPress={() => setDetailPanelVisible(false)}
            >
              <View style={styles.modalSheet}>
                <Text style={styles.detailDateTitle}>
                  {renderDateTitle(selectedKey)}
                </Text>
                <ScrollView style={{ maxHeight: 340 }}>
                  {selectedEvents.map((ev) => (
                    <View key={ev._id} style={styles.detailItem}>
                      <View
                        style={[
                          styles.detailBadge,
                          { backgroundColor: ev._color },
                        ]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.detailTitle} numberOfLines={2}>
                          {ev.title}
                        </Text>
                        <Text style={styles.detailSub}>
                          {ev.hour
                            ? `${ev.hour} · ${labelFromCategory(ev.category)}`
                            : labelFromCategory(ev.category)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <Pressable
                  onPress={() => setDetailPanelVisible(false)}
                  style={[styles.closeDetailBtn, { alignSelf: "center" }]}
                >
                  <Text style={styles.closeDetailText}>Cerrar</Text>
                </Pressable>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </ScrollView>

      {/* Footer responsive */}
      {Platform.OS === "web" && (isLaptopWeb || isDesktopWeb) && (
        <View
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: "#fff",
          }}
        >
          <Footer
            onAboutPress={goToAbout}
            onPrivacyPress={goToPrivacy}
            onConditionsPress={goToConditions}
          />
        </View>
      )}
    </View>
  );
}

// Convertir el nombre interno de una categoría en un texto más amigable para el usuario.
function labelFromCategory(cat) {
  const v = (cat || "").toLowerCase();
  switch (v) {
    case "deporte":
      return "Deporte";
    case "concurso":
      return "Concurso y taller";
    case "cultura":
      return "Cultura e Historia";
    case "arte":
      return "Arte y Música";
    case "fiestas":
      return "Fiestas y Tradiciones";
    default:
      return "Otros";
  }
}

// Convierte la clave de fecha "2025-03-14" en un texto amigable
function renderDateTitle(key) {
  if (!key) return "";
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekNamesLong = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return `${d}  ${weekNamesLong[date.getDay()]}`;
}

// Estilos
const styles = StyleSheet.create({
  mobileMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f4f6f7",
    zIndex: 20,
    justifyContent: "space-between",
  },

  mobileMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },

  mobileMenuBody: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "flex-start",
    gap: 30,
  },

  mobileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  mobileMenuText: {
    color: "#014869",
    fontSize: 16,
    fontWeight: "600",
  },

  mobileBottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#014869",
    backgroundColor: "#fff",
  },

  /* CALENDAR HEADER */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Platform.OS === "web" ? 1 : 10,
  },

  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#014869",
  },

  navBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef5f8",
  },

  navBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#014869",
  },

  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingHorizontal: 4,
  },

  weekHeaderText: {
    width: "13.6%",
    textAlign: "center",
    color: "#014869",
    fontWeight: "700",
    opacity: 0.85,
  },

  /* GRID */
  calendarGrid: {
    backgroundColor: "#F2F4F5",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },

  dayCell: {
    width: "13.6%",
    aspectRatio: 0.9,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
  },

  dayCellWeb: {
    aspectRatio: 1,
    marginVertical: 1,
  },

  dayCellEmpty: {
    backgroundColor: "transparent",
  },

  todayCell: {
    borderWidth: 2,
    borderColor: "#014869",
  },

  selectedCell: {
    borderWidth: 2,
    borderColor: "#F3B23F",
  },

  dayNumber: {
    fontWeight: "700",
    color: "#334155",
    fontSize: 12,
  },

  todayNumber: {
    color: "#014869",
  },

  dotsRow: {
    position: "absolute",
    bottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },

  moreDots: {
    fontSize: 9,
    marginLeft: 2,
    color: "#64748b",
    fontWeight: "600",
  },

  /* DETAIL PANEL */
  detailDateTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#014869",
    marginBottom: 8,
  },

  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },

  detailBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  detailTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  detailSub: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },

  /* MODAL WEB */
  webModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  webModalContent: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },

  /* MODAL MÓVIL */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-end",
  },

  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: Dimensions.get("window").height * 0.6,
  },

  closeDetailBtn: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: "#014869",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  closeDetailText: {
    color: "#fff",
    fontWeight: "700",
  },
});
