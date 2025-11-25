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
    ? "http://10.0.2.2:5000/api/events"
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
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });

  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "info" }),
      2500
    );
  };

  const navigation = useNavigation();

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

  const goToProfile = () => navigation.navigate("AdminProfile");
  const goToNotifications = () => navigation.navigate("AdminNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");

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

  const [hoveredId, setHoveredId] = useState(null);
  const bottomSafeArea = Platform.OS === "web" ? 110 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

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
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              position: "relative",
              marginRight: 12,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#0094A2",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 24, height: 24, tintColor: "#fff" }}
            />
            <Image
              source={require("../assets/iconos/corona.png")}
              style={{
                position: "absolute",
                top: -6,
                left: -6,
                width: 20,
                height: 20,
                resizeMode: "contain",
              }}
            />
          </View>
          <View>
            <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
              Admin.
            </Text>
            <Text style={{ color: "#6c757d", fontSize: 13 }}>{adminName}</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#0094A2",
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
            source={require("../assets/iconos/search-admin.png")}
            style={{ width: 16, height: 16, tintColor: "#0094A2" }}
          />
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={goToNotifications}
            style={{
              marginRight: 20,
              ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
            }}
          >
            <Image
              source={require("../assets/iconos/bell2.png")}
              style={{ width: 22, height: 22, tintColor: "#0094A2" }}
            />
          </Pressable>

          <Pressable
            onPress={goToCalendar}
            style={{
              marginRight: 20,
              ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
            }}
          >
            <Image
              source={require("../assets/iconos/calendar-admin.png")}
              style={{ width: 22, height: 22, tintColor: "#0094A2" }}
            />
          </Pressable>

          <Pressable
            onPress={toggleMenu}
            style={Platform.OS === "web" ? { cursor: "pointer" } : {}}
          >
            <Image
              source={
                menuVisible
                  ? require("../assets/iconos/close-admin.png")
                  : require("../assets/iconos/menu-admin.png")
              }
              style={{ width: 24, height: 24, tintColor: "#0094A2" }}
            />
          </Pressable>
        </View>
      </View>

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

      <View
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: "#f5f6f7",
          marginTop: 60,
          paddingBottom: bottomSafeArea,
        }}
      >
        {!editing ? (
          <>
            {filtered.length > 0 && (
              <Text
                style={{
                  fontWeight: "bold",
                  marginBottom: 12,
                  color: "#02486b",
                }}
              >
                Listado de eventos:
              </Text>
            )}

            <ScrollView
              style={{ maxHeight: 500 }}
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: filtered.length === 0 ? "center" : "flex-start",
                alignItems: "stretch",
              }}
            >
              {filtered.length > 0 ? (
                filtered.map((ev) => {
                  const baseRowStyle = {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    paddingVertical: 12,
                    paddingLeft: 18,
                    paddingRight: 10,
                    backgroundColor:
                      Platform.OS === "web" && hoveredId === ev._id
                        ? "#34a0a4"
                        : "#02486b",
                    borderRadius: 3,
                  };

                  return (
                    <Pressable
                      key={ev._id}
                      onPress={() =>
                        navigation.navigate("AdminEventDetail", {
                          eventId: ev._id,
                        })
                      }
                      {...(Platform.OS === "web"
                        ? {
                            onMouseEnter: () => setHoveredId(ev._id),
                            onMouseLeave: () => setHoveredId(null),
                            style: baseRowStyle,
                          }
                        : {
                            style: ({ pressed }) => ({
                              ...baseRowStyle,
                              opacity: pressed ? 0.9 : 1,
                            }),
                          })}
                    >
                      <Text
                        numberOfLines={1}
                        style={{
                          flex: 1,
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: 15,
                          marginRight: 12,
                        }}
                      >
                        {ev.title}
                      </Text>

                      <View style={{ flexDirection: "row" }}>
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            handleEdit(ev);
                          }}
                          style={({ pressed }) => ({
                            width: 42,
                            height: 42,
                            backgroundColor: "#02486b",
                            borderRadius: 3,
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 10,
                            opacity: pressed ? 0.85 : 1,
                          })}
                        >
                          <Image
                            source={require("../assets/iconos/editar.png")}
                            style={{ width: 20, height: 20, tintColor: "#fff" }}
                          />
                        </Pressable>

                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation();
                            confirmDelete(ev._id);
                          }}
                          style={({ pressed }) => ({
                            width: 42,
                            height: 42,
                            backgroundColor: "#02486b",
                            borderRadius: 3,
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: pressed ? 0.85 : 1,
                          })}
                        >
                          <Image
                            source={require("../assets/iconos/borrar.png")}
                            style={{ width: 20, height: 20, tintColor: "#fff" }}
                          />
                        </Pressable>
                      </View>
                    </Pressable>
                  );
                })
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
            <Text
              style={{
                fontWeight: "bold",
                marginBottom: 14,
                fontSize: 18,
                color: "#02486b",
                textAlign: "center",
              }}
            >
              Editar evento
            </Text>

            <ScrollView
              style={{
                backgroundColor: "#fff",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#e2e8f0",
                shadowColor: "#000",
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
              contentContainerStyle={{
                paddingBottom: Platform.OS === "web" ? 150 : 80,
              }}
            >
              {[
                {
                  label: "Título",
                  key: "title",
                  placeholder: "Ej. Feria de verano",
                },
                {
                  label: "Descripción",
                  key: "description",
                  placeholder: "Detalla el evento...",
                  multiline: true,
                },
                {
                  label: "Fecha (DD/MM/YYYY)",
                  key: "date",
                  placeholder: "31/12/2025",
                },
                {
                  label: "Hora (HH:MM)",
                  key: "hour",
                  placeholder: "21:00",
                },
                {
                  label: "Lugar",
                  key: "location",
                  placeholder: "Plaza Mayor",
                },
              ].map((f, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontWeight: "600",
                      color: "#014869",
                      marginBottom: 6,
                    }}
                  >
                    {f.label}:
                  </Text>
                  <TextInput
                    value={form[f.key]}
                    onChangeText={(t) => setForm({ ...form, [f.key]: t })}
                    placeholder={f.placeholder}
                    placeholderTextColor="#9aa4af"
                    multiline={f.multiline}
                    style={{
                      backgroundColor: "#f9fafb",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#cbd5e1",
                      paddingHorizontal: 12,
                      paddingVertical: f.multiline ? 10 : 8,
                      height: f.multiline ? 90 : 40,
                      textAlignVertical: f.multiline ? "top" : "center",
                    }}
                  />
                </View>
              ))}

              <Text
                style={{
                  fontWeight: "600",
                  color: "#014869",
                  marginBottom: 6,
                }}
              >
                Categoría:
              </Text>
              <View style={{ zIndex: 5000, marginBottom: 16 }}>
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
                    backgroundColor: "#f9fafb",
                    borderColor: "#cbd5e1",
                    borderRadius: 8,
                    height: 44,
                  }}
                  dropDownContainerStyle={{
                    borderColor: "#cbd5e1",
                  }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 8,
                  gap: 18,
                }}
              >
                <Pressable
                  onPress={handleCancel}
                  style={{
                    backgroundColor: "#e5e7eb",
                    borderRadius: 25,
                    paddingVertical: 10,
                    paddingHorizontal: 30,
                  }}
                >
                  <Text style={{ color: "#333", fontWeight: "600" }}>
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSave}
                  disabled={loading}
                  style={{
                    backgroundColor: "#F3B23F",
                    borderRadius: 25,
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

      {toast.visible && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 80,
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
          <Text
            style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}
          >
            {toast.message}
          </Text>
        </Animated.View>
      )}

      {Platform.OS === "web" ? (
        <View
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            zIndex: 20,
            backgroundColor: "transparent",
          }}
        >
          <Footer
            onAboutPress={goToAboutUs}
            onPrivacyPress={goToPrivacy}
            onConditionsPress={goToConditions}
          />
        </View>
      ) : (
        <Footer
          onAboutPress={goToAboutUs}
          onPrivacyPress={goToPrivacy}
          onConditionsPress={goToConditions}
        />
      )}
    </View>
  );
}
