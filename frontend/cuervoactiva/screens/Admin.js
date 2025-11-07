// frontend/src/screens/Admin.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  Image,
  Modal,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import DropDownPicker from "react-native-dropdown-picker";
import { getSession } from "../services/sessionManager";
import { useNavigation } from "@react-navigation/native";

const API_URL =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000/api/events"
    : "http://localhost:5000/api/events";

export default function Admin() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [adminName, setAdminName] = useState("Admin");
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    _id: null,
    title: "",
    description: "",
    date: "",
    hour: "",
    location: "",
    category: "deporte",
    image_url: "",
  });

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [modalVisible, setModalVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // === Mensajes visuales (Toast personalizado) ===
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "info" }), 2500);
  };

  const navigation = useNavigation();

  // === Cargar eventos y usuario ===
  useEffect(() => {
    const loadData = async () => {
      const session = await getSession();
      if (session?.name) setAdminName(session.name);

      try {
        const token = session?.token;
        const res = await fetch(API_URL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Error al obtener eventos");
        const data = await res.json();
        setEvents(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
        showToast("❌ No se pudieron cargar los eventos.", "error");
      }
    };
    loadData();
  }, []);

  // === Filtro de búsqueda ===
  useEffect(() => {
    if (!search.trim()) setFiltered(events);
    else {
      const term = search.toLowerCase();
      setFiltered(
        events.filter(
          (e) =>
            e.title?.toLowerCase().includes(term) ||
            e.location?.toLowerCase().includes(term) ||
            e.category?.toLowerCase().includes(term)
        )
      );
    }
  }, [search, events]);

  // === Edición de evento ===
  const handleEdit = (ev) => {
    setForm({
      _id: ev._id,
      title: ev.title,
      description: ev.description,
      date: ev.date || "",
      hour: ev.hour || "",
      location: ev.location,
      category: ev.category,
      image_url: ev.image_url || "",
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      _id: null,
      title: "",
      description: "",
      date: "",
      hour: "",
      location: "",
      category: "deporte",
      image_url: "",
    });
  };

  // === Guardar cambios de evento ===
  const handleSave = async () => {
    if (!form.title || !form.description || !form.location)
      return showToast("⚠️ Completa todos los campos requeridos.", "warning");

    setLoading(true);
    try {
      const session = await getSession();
      const token = session?.token;

      const res = await fetch(`${API_URL}/${form._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al guardar el evento");
      const data = await res.json();

      setEvents((prev) => prev.map((e) => (e._id === data._id ? data : e)));
      setFiltered((prev) => prev.map((e) => (e._id === data._id ? data : e)));

      showToast("✅ Evento actualizado correctamente.", "success");
      handleCancel();
    } catch (err) {
      console.error(err);
      showToast("❌ Error al guardar los cambios.", "error");
    } finally {
      setLoading(false);
    }
  };

  // === Confirmar eliminación (modal visual) ===
  const confirmDelete = (id) => {
    setEventToDelete(id);
    setModalVisible(true);
  };

  const handleDeleteConfirmed = async () => {
    setModalVisible(false);
    if (!eventToDelete) return;

    try {
      const session = await getSession();
      const token = session?.token;
      const res = await fetch(`${API_URL}/${eventToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar evento");
      setEvents((prev) => prev.filter((e) => e._id !== eventToDelete));
      setFiltered((prev) => prev.filter((e) => e._id !== eventToDelete));

      showToast("✅ Evento eliminado correctamente.", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ No se pudo eliminar el evento.", "error");
    } finally {
      setEventToDelete(null);
    }
  };

  // === Navegaciones ===
  const goToProfile = () => navigation.navigate("AdminProfile");
  const goToNotifications = () => navigation.navigate("AdminNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");

  // === Menú lateral ===
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
      <Header hideAuthButtons />

      {/* === Barra superior === */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ marginRight: 6 }}>👑</Text>
          <Text>Admin. {adminName}</Text>
        </View>

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

        <Pressable onPress={goToCalendar} style={{ marginRight: 10 }}>
          <Image
            source={require("../assets/iconos/calendar-admin.png")}
            style={{ width: 26, height: 26 }}
          />
        </Pressable>

        <Pressable onPress={goToNotifications} style={{ marginRight: 10 }}>
          <Image source={require("../assets/iconos/bell2.png")} />
        </Pressable>

        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close-admin.png")
                : require("../assets/iconos/menu-admin.png")
            }
            style={{ width: 26, height: 26 }}
          />
        </Pressable>
      </View>

      {/* === Menú lateral (solo web) === */}
      {Platform.OS === "web" && menuVisible && (
        <>
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
            }}
          >
            {[
              { label: "Perfil", action: goToProfile },
              { label: "Cultura e Historia", action: goToCulturaHistoria },
              { label: "Ver usuarios", route: "AdminUsers" },
              { label: "Contacto", action: goToContact },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  toggleMenu();
                  if (item.action) item.action();
                  else if (item.route) navigation.navigate(item.route);
                }}
                style={{ marginBottom: 25 }}
              >
                <Text
                  style={{
                    color: "#014869",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </>
      )}

      {/* === Contenido principal === */}
      <View style={{ flex: 1, padding: 16 }}>
        {!editing ? (
          <>
            {filtered.length > 0 && (
              <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
                Listado de eventos:
              </Text>
            )}

            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: filtered.length === 0 ? "center" : "flex-start",
                alignItems: filtered.length === 0 ? "center" : "stretch",
              }}
            >
              {filtered.length > 0 ? (
                filtered.map((ev) => (
                  <Pressable
                    key={ev._id}
                    onPress={() =>
                      navigation.navigate("AdminEventDetail", {
                        eventId: ev._id,
                      })
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      padding: 8,
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 10,
                    }}
                  >
                    <Text numberOfLines={1} style={{ flex: 1 }}>
                      {ev.title}
                    </Text>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEdit(ev);
                      }}
                      style={{ margin: 4 }}
                    >
                      <Text>✏️</Text>
                    </Pressable>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        confirmDelete(ev._id);
                      }}
                      style={{ margin: 4 }}
                    >
                      <Text>🗑️</Text>
                    </Pressable>
                  </Pressable>
                ))
              ) : (
                <Text
                  style={{
                    textAlign: "center",
                    color: "#777",
                    fontStyle: "italic",
                    fontSize: 15,
                  }}
                >
                  {search.trim()
                    ? "🔍 No se encontraron eventos."
                    : "📭 No hay eventos disponibles."}
                </Text>
              )}
            </ScrollView>
          </>
        ) : (
          <>
            {/* === FORMULARIO EDICIÓN === */}
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Editar evento
            </Text>
            <ScrollView>
              <Text style={{ fontWeight: "600", marginBottom: 4 }}>Título:</Text>
              <TextInput
                value={form.title}
                onChangeText={(t) => setForm({ ...form, title: t })}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  height: 36,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                }}
              />

              <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                Descripción:
              </Text>
              <TextInput
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                multiline
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  height: 90,
                  padding: 10,
                  marginBottom: 10,
                  textAlignVertical: "top",
                }}
              />

              <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                Fecha (DD/MM/YYYY):
              </Text>
              <TextInput
                value={form.date}
                onChangeText={(t) => setForm({ ...form, date: t })}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  height: 36,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                }}
              />

              <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                Hora (HH:MM):
              </Text>
              <TextInput
                value={form.hour}
                onChangeText={(t) => setForm({ ...form, hour: t })}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  height: 36,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                }}
              />

              <Text style={{ fontWeight: "600", marginBottom: 4 }}>Lugar:</Text>
              <TextInput
                value={form.location}
                onChangeText={(t) => setForm({ ...form, location: t })}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  height: 36,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                }}
              />

              <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                Categoría:
              </Text>
              <DropDownPicker
                open={open}
                value={form.category}
                items={[
                  { label: "Deporte", value: "deporte" },
                  { label: "Concurso y Taller", value: "concurso" },
                  { label: "Cultura e Historia", value: "cultura" },
                  { label: "Arte y Música", value: "arte" },
                ]}
                setOpen={setOpen}
                setValue={(callback) =>
                  setForm((prev) => ({
                    ...prev,
                    category: callback(prev.category),
                  }))
                }
                style={{
                  backgroundColor: "#fff",
                  borderColor: "#ccc",
                  borderRadius: 10,
                  height: 40,
                  marginBottom: 10,
                  zIndex: 10,
                }}
                dropDownContainerStyle={{
                  borderColor: "#ccc",
                }}
              />

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 4,
                  gap: 16,
                }}
              >
                <Pressable
                  onPress={handleCancel}
                  style={{
                    backgroundColor: "#ccc",
                    borderRadius: 20,
                    paddingVertical: 10,
                    paddingHorizontal: 30,
                  }}
                >
                  <Text>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={handleSave}
                  disabled={loading}
                  style={{
                    backgroundColor: "#F3B23F",
                    borderRadius: 20,
                    paddingVertical: 10,
                    paddingHorizontal: 30,
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </>
        )}
      </View>

      {/* === MODAL DE CONFIRMACIÓN PERSONALIZADO === */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              width: 350,
              borderRadius: 15,
              padding: 25,
              alignItems: "center",
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#014869",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              ¿Seguro que quieres eliminar este evento?
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#555",
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              ⚠️ Esta acción no se puede deshacer.
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Pressable
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: "#ccc",
                  borderRadius: 25,
                  paddingVertical: 10,
                  paddingHorizontal: 25,
                }}
              >
                <Text style={{ color: "#333", fontWeight: "600" }}>
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={handleDeleteConfirmed}
                style={{
                  backgroundColor: "#F3B23F",
                  borderRadius: 25,
                  paddingVertical: 10,
                  paddingHorizontal: 25,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Eliminar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* === TOAST VISUAL === */}
      {toast.visible && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 30,
            alignSelf: "center",
            backgroundColor:
              toast.type === "success"
                ? "#4BB543"
                : toast.type === "error"
                ? "#D9534F"
                : toast.type === "warning"
                ? "#F0AD4E"
                : "#014869",
            paddingVertical: 12,
            paddingHorizontal: 25,
            borderRadius: 25,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>
            {toast.message}
          </Text>
        </Animated.View>
      )}

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
