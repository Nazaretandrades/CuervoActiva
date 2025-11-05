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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

/** === CONFIG API (igual que en user.js) === */
const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";
const API_URL = `${API_BASE}/api/events`;

/** === Colores por categoría (idénticos a User.js) === */
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

/** Devuelve un Date clonado con hora 00:00 */
function atStartOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function parseDDMMYYYY(str) {
  if (!str || typeof str !== "string") return null;

  // Si es formato ISO o YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const [y, m, d] = str
      .substring(0, 10)
      .split("-")
      .map((x) => parseInt(x, 10));
    // ⚠️ Corregimos forzando la hora a mediodía
    const date = new Date(y, m - 1, d, 12, 0, 0);
    if (!isNaN(date.getTime())) return atStartOfDay(date);
  }

  // Si es DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [dd, mm, yyyy] = str.split("/").map((x) => parseInt(x, 10));
    const date = new Date(yyyy, mm - 1, dd, 12, 0, 0); // mediodía
    if (!isNaN(date.getTime())) return atStartOfDay(date);
  }

  return null;
}

/** Formatea Date -> 'YYYY-MM-DD' (para agrupar) */
function ymdKey(date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Crea la matriz del mes empezando en Lunes */
function getMonthMatrix(year, monthIndex) {
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  // 0:Dom 1:Lun ... 6:Sab -> queremos lunes como inicio (1)
  const firstWeekday = (first.getDay() + 6) % 7; // convierte domingo(0)→6, lunes(1)→0...
  const daysInMonth = last.getDate();

  const matrix = [];
  let week = [];

  // Relleno antes del 1er día del mes
  for (let i = 0; i < firstWeekday; i++) week.push(null);

  for (let day = 1; day <= daysInMonth; day++) {
    week.push(new Date(year, monthIndex, day));
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  // Relleno final
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

/** Badge de color para cada evento */
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
  const [role, setRole] = useState("user"); // user | organizer | admin
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedKey, setSelectedKey] = useState(null); // 'YYYY-MM-DD'
  const [mobilePanelVisible, setMobilePanelVisible] = useState(false);

  /** === Cargar sesión para rol (mismo patrón que CulturaHistoria) === */
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

  /** === Carga de eventos === */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("No se pudieron obtener los eventos");
        const data = await res.json();

        // Normaliza cada evento: fecha, color por categoría
        const normalized = (data || []).map((ev) => {
          // Tu backend guarda ev.date como 'DD/MM/YYYY'
          const d = parseDDMMYYYY(ev.date);
          const cat = (ev.category || "").toLowerCase();
          const color = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
          return {
            ...ev,
            _date: d, // Date
            _key: d ? ymdKey(d) : null,
            _color: color,
          };
        });
        setEvents(normalized);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  /** === Agrupar eventos por día (clave 'YYYY-MM-DD') === */
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

  const goPrevMonth = () => {
    const d = new Date(year, monthIndex - 1, 1);
    setCurrentDate(d);
    setSelectedKey(null);
  };
  const goNextMonth = () => {
    const d = new Date(year, monthIndex + 1, 1);
    setCurrentDate(d);
    setSelectedKey(null);
  };

  const handleSelectDay = (key) => {
    if (!key) return;
    setSelectedKey((prev) => (prev === key ? null : key));
    if (Platform.OS !== "web") {
      // En móvil abrimos panel inferior
      setMobilePanelVisible(true);
    }
  };

  /** === Panel detalle para el día seleccionado === */
  const selectedEvents = selectedKey ? eventsByDay[selectedKey] || [] : [];

  /** === Restricción de rol (como CulturaHistoria): Admin solo web === */
  if (role === "admin" && Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Header hideAuthButtons />
        <View style={styles.deniedWrap}>
          <Text style={styles.deniedText}>
            Acceso denegado. Esta sección de calendario solo está disponible en
            web para administradores.
          </Text>
        </View>
        {/* Admin en móvil no muestra footer (mismo criterio de CulturaHistoria) */}
      </View>
    );
  }

  const isWeb = Platform.OS === "web";
  const gridMaxWidth = isWeb
    ? 860
    : Math.min(Dimensions.get("window").width - 24, 860);

  return (
    <View style={styles.container}>
      <Header hideAuthButtons />

      {/* === CONTENIDO === */}
      <View style={styles.contentWrapper}>
        {/* Encabezado mes/año + nav */}
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

        {/* Cabecera de días */}
        <View style={[styles.weekHeader, { width: gridMaxWidth }]}>
          {weekNamesShortEs.map((d) => (
            <Text key={d} style={styles.weekHeaderText}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendario */}
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

                    {/* Puntitos de colores (máx 3 visibles) */}
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

        {/* === DETALLE DEL DÍA (Web: tarjeta flotante a la izquierda; Móvil: panel inferior) === */}
        {isWeb ? (
          selectedKey && (
            <View
              style={[
                styles.webDetailCard,
                { width: Math.min(340, gridMaxWidth - 520) },
              ]}
            >
              <Text style={styles.detailDateTitle}>
                {renderDateTitle(selectedKey)}
              </Text>
              <View style={styles.detailList}>
                {selectedEvents.map((ev) => (
                  <View key={ev._id} style={styles.detailItem}>
                    <View
                      style={[
                        styles.detailBadge,
                        { backgroundColor: ev._color },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailTitle} numberOfLines={1}>
                        {ev.title}
                      </Text>
                      {/* Si tienes 'hour' en tu modelo, la mostramos */}
                      {ev.hour ? (
                        <Text style={styles.detailSub}>
                          {ev.hour} · {labelFromCategory(ev.category)}
                        </Text>
                      ) : (
                        <Text style={styles.detailSub}>
                          {labelFromCategory(ev.category)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
                {selectedEvents.length === 0 && (
                  <Text style={styles.detailEmpty}>No hay eventos.</Text>
                )}
              </View>
              <Pressable
                onPress={() => setSelectedKey(null)}
                style={styles.closeDetailBtn}
              >
                <Text style={styles.closeDetailText}>Cerrar</Text>
              </Pressable>
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
                        {ev.hour ? (
                          <Text style={styles.detailSub}>
                            {ev.hour} · {labelFromCategory(ev.category)}
                          </Text>
                        ) : (
                          <Text style={styles.detailSub}>
                            {labelFromCategory(ev.category)}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                  {selectedEvents.length === 0 && (
                    <Text style={styles.detailEmpty}>No hay eventos.</Text>
                  )}
                </ScrollView>
                <Pressable
                  onPress={() => setMobilePanelVisible(false)}
                  style={[
                    styles.closeDetailBtn,
                    { alignSelf: "center", marginTop: 8 },
                  ]}
                >
                  <Text style={styles.closeDetailText}>Cerrar</Text>
                </Pressable>
              </View>
            </TouchableOpacity>
          </Modal>
        )}
      </View>

      {/* Footer: en web sí; en móvil puedes ocultarlo si quieres, como hiciste en CulturaHistoria */}
      {Platform.OS === "web" && <Footer />}
    </View>
  );
}

/** Label legible desde un valor de categoría */
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

/** Título bonito para el panel de detalle: '12 Sábado' */
function renderDateTitle(key) {
  if (!key) return "";
  const [y, m, d] = key.split("-").map((n) => parseInt(n, 10));
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
  const w = weekNamesLong[date.getDay()];
  return `${d}  ${w}`;
}

/** === STYLES === */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
    marginTop: 8,
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
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayCellEmpty: {
    backgroundColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: "#014869",
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: "#F3B23F",
  },
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

  /** Tarjeta de detalle en web */
  webDetailCard: {
    position: "absolute",
    left: 40,
    top: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
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
  detailBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  detailTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  detailSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  detailEmpty: { color: "#6b7280", fontStyle: "italic" },
  closeDetailBtn: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: "#014869",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closeDetailText: { color: "#fff", fontWeight: "700" },

  /** Móvil: modal/panel inferior */
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

  /** Acceso denegado (admin en móvil) */
  deniedWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  deniedText: { fontSize: 16, color: "#d00", textAlign: "center" },
});
