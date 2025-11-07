// frontend/src/screens/Calendar.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { useNavigation } from "@react-navigation/native";
import OrganizerMenu from "./OrganizerMenu"; // ✅ Añadido
import UserMenu from "./UserMenu"; // ✅ Añadido

/** === CONFIG API === */
const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";
const API_URL = `${API_BASE}/api/events`;

/** === Colores por categoría === */
const CATEGORY_COLORS = {
  all: "#014869",
  deporte: "#F3B23F",
  concurso: "#FFD43B",
  cultura: "#784BA0",
  arte: "#2BBBAD",
  fiestas: "#E67E22",
  default: "#014869",
};

/** === Helpers de fechas === */
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
const weekNamesShortEs = ["L", "M", "X", "J", "V", "S", "D"];

function atStartOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function parseDDMMYYYY(str) {
  if (!str || typeof str !== "string") return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [y, m, d] = str.substring(0, 10).split("-").map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    if (!isNaN(date.getTime())) return atStartOfDay(date);
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split("/").map(Number);
    const date = new Date(yyyy, mm - 1, dd, 12, 0, 0);
    if (!isNaN(date.getTime())) return atStartOfDay(date);
  }
  return null;
}
function ymdKey(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function getMonthMatrix(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = last.getDate();
  const matrix = [];
  let week = [];
  for (let i = 0; i < firstWeekday; i++) week.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, monthIndex, day));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}
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

export default function Calendar() {
  const navigation = useNavigation();
  const [role, setRole] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedKey, setSelectedKey] = useState(null);
  const [mobilePanelVisible, setMobilePanelVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // === Cargar sesión y rol ===
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
        if (session?.user?.role) setRole(session.user.role);
        else if (session?.role) setRole(session.role);
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };
    loadSession();
  }, []);

  // === Cargar eventos ===
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

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const ev of events) {
      if (!ev._key) continue;
      if (!map[ev._key]) map[ev._key] = [];
      map[ev._key].push(ev);
    }
    return map;
  }, [events]);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();
  const matrix = useMemo(
    () => getMonthMatrix(year, monthIndex),
    [year, monthIndex]
  );

  const goPrevMonth = () => setCurrentDate(new Date(year, monthIndex - 1, 1));
  const goNextMonth = () => setCurrentDate(new Date(year, monthIndex + 1, 1));
  const handleSelectDay = (key) => {
    if (!key) return;
    setSelectedKey((prev) => (prev === key ? null : key));
    if (Platform.OS !== "web") setMobilePanelVisible(true);
  };

  const selectedEvents = selectedKey ? eventsByDay[selectedKey] || [] : [];

  // === Navegaciones dinámicas ===
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
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToCalendar = () => navigation.navigate("Calendar");

  // ✅ NUEVO: función ir al Home Organizer (solo móvil)
  const goToOrganizerHome = () => {
    if (Platform.OS !== "web" && role === "organizer") {
      const currentRoute = navigation.getState().routes.slice(-1)[0].name;
      if (currentRoute === "Organizer") {
        navigation.reset({ index: 0, routes: [{ name: "Organizer" }] });
      } else {
        navigation.navigate("Organizer");
      }
    }
  };

  // === Toggle menú lateral ===
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

  const isWeb = Platform.OS === "web";
  const gridMaxWidth = isWeb
    ? 860
    : Math.min(Dimensions.get("window").width - 24, 860);

  /** === Config visual según rol === */
  let colorMain = "#014869";
  let iconCalendar, iconBell, iconMenu, iconClose;

  if (role === "organizer") {
    colorMain = "#F3B23F";
    iconCalendar = require("../assets/iconos/calendar-organizador.png");
    iconBell = require("../assets/iconos/bell3.png");
    iconMenu = require("../assets/iconos/menu-organizador.png");
    iconClose = require("../assets/iconos/close-organizador.png");
  } else if (role === "admin") {
    colorMain = "#33ADB5";
    iconCalendar = require("../assets/iconos/calendar-admin.png");
    iconBell = require("../assets/iconos/bell2.png");
    iconMenu = require("../assets/iconos/menu-admin.png");
    iconClose = require("../assets/iconos/close-admin.png");
  } else if (role === "user") {
    colorMain = "#014869";
    iconCalendar = require("../assets/iconos/calendar.png");
    iconBell = require("../assets/iconos/bell.png");
    iconMenu = require("../assets/iconos/menu-usuario.png");
    iconClose = require("../assets/iconos/close.png");
  }

  // === Menú lateral web ===
  const menuItems =
    role === "admin"
      ? [
          { label: "Perfil", action: goToProfile },
          { label: "Cultura e Historia", action: goToCulturaHistoria },
          { label: "Ver Usuarios", action: goToContact },
        ]
      : role === "organizer"
      ? [
          { label: "Perfil", action: goToProfile },
          { label: "Cultura e Historia", action: goToCulturaHistoria },
          { label: "Contacto", action: goToContact },
        ]
      : [
          { label: "Perfil", action: goToProfile },
          { label: "Cultura e Historia", action: goToCulturaHistoria },
          { label: "Ver Favoritos", action: goToContact },
          { label: "Contacto", action: goToContact },
        ];

  return (
    <View style={styles.container}>
      <Header hideAuthButtons />

      {/* === Barra superior === */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          justifyContent: "flex-end",
          borderBottomWidth: 1,
          borderColor: "#eee",
          gap: 15,
        }}
      >
        <Pressable onPress={goToCalendar}>
          <Image
            source={iconCalendar}
            style={{ width: 26, height: 26, tintColor: colorMain }}
          />
        </Pressable>
        <Pressable onPress={goToNotifications}>
          <Image
            source={iconBell}
            style={{ width: 26, height: 26, tintColor: colorMain }}
          />
        </Pressable>
        <Pressable onPress={toggleMenu}>
          <Image
            source={menuVisible ? iconClose : iconMenu}
            style={{ width: 26, height: 26, tintColor: colorMain }}
          />
        </Pressable>
      </View>

      {/* === Menú lateral web === */}
      {isWeb && menuVisible && (
        <>
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View style={styles.menuOverlay} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}
          >
            {menuItems.map((item, i) => (
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
      )}

      {/* === Menú móvil === */}
      {!isWeb && menuVisible && (
        role === "organizer" ? (
          <OrganizerMenu onClose={toggleMenu} onHomePress={goToOrganizerHome} />
        ) : (
          <UserMenu onClose={toggleMenu} />
        )
      )}

      {/* === Contenido del calendario === */}
      <View style={styles.contentWrapper}>
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

        <View style={[styles.weekHeader, { width: gridMaxWidth }]}>
          {weekNamesShortEs.map((d) => (
            <Text key={d} style={styles.weekHeaderText}>
              {d}
            </Text>
          ))}
        </View>

        <View style={[styles.calendarGrid, { width: gridMaxWidth }]}>
          {matrix.map((week, r) => (
            <View key={r} style={styles.weekRow}>
              {week.map((date, c) => {
                const key = date ? ymdKey(date) : null;
                const day = date ? date.getDate() : "";
                const todayKey = ymdKey(atStartOfDay(new Date()));
                const isToday = key && key === todayKey;
                const dayEvents = key ? eventsByDay[key] || [] : [];
                return (
                  <Pressable
                    key={`${r}-${c}`}
                    onPress={() => handleSelectDay(key)}
                    disabled={!date}
                    style={[
                      styles.dayCell,
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

        {/* === Panel detalle === */}
        {isWeb ? (
          selectedKey && (
            <View style={[styles.webDetailCard]}>
              <Text style={styles.detailDateTitle}>
                {renderDateTitle(selectedKey)}
              </Text>
              <ScrollView style={styles.detailList}>
                {selectedEvents.map((ev) => (
                  <View key={ev._id} style={styles.detailItem}>
                    <View
                      style={[styles.detailBadge, { backgroundColor: ev._color }]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailTitle}>{ev.title}</Text>
                      <Text style={styles.detailSub}>
                        {ev.hour
                          ? `${ev.hour} · ${labelFromCategory(ev.category)}`
                          : labelFromCategory(ev.category)}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )
        ) : (
          <Modal
            animationType="slide"
            transparent
            visible={mobilePanelVisible}
            onRequestClose={() => setMobilePanelVisible(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalBackdrop}
              onPress={() => setMobilePanelVisible(false)}
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
                  onPress={() => setMobilePanelVisible(false)}
                  style={[styles.closeDetailBtn, { alignSelf: "center" }]}
                >
                  <Text style={styles.closeDetailText}>Cerrar</Text>
                </Pressable>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
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

/** === Helpers extra === */
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

/** === STYLES === */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  menuOverlay: {
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
  menuItem: { color: "#014869", fontSize: 18, fontWeight: "700" },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  monthTitle: { fontSize: 18, fontWeight: "700", color: "#014869" },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eef5f8",
  },
  navBtnText: { fontSize: 20, fontWeight: "700", color: "#014869" },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  weekHeaderText: {
    width: "13.6%",
    textAlign: "center",
    color: "#014869",
    fontWeight: "700",
    opacity: 0.85,
  },
  calendarGrid: {
    backgroundColor: "#F2F4F5",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  dayCell: {
    width: "13.6%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCellEmpty: { backgroundColor: "transparent" },
  todayCell: { borderWidth: 2, borderColor: "#014869" },
  selectedCell: { borderWidth: 2, borderColor: "#F3B23F" },
  dayNumber: { fontWeight: "700", color: "#334155" },
  todayNumber: { color: "#014869" },
  dotsRow: {
    position: "absolute",
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  moreDots: {
    fontSize: 10,
    marginLeft: 2,
    color: "#64748b",
    fontWeight: "600",
  },
  webDetailCard: {
    position: "absolute",
    left: 40,
    top: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  detailDateTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#014869",
    marginBottom: 10,
  },
  detailList: { gap: 10 },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  detailBadge: { width: 10, height: 10, borderRadius: 5 },
  detailTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  detailSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  closeDetailBtn: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: "#014869",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeDetailText: { color: "#fff", fontWeight: "700" },
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
});
