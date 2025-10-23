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
  Alert,
  Image,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import DropDownPicker from "react-native-dropdown-picker";
import { getSession } from "../services/sessionManager";

const API_URL = "http://localhost:5000/api/events";

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

  // === Menú lateral (solo web) ===
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  // === Cargar eventos ===
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
        alert("No se pudieron cargar los eventos");
      }
    };
    loadData();
  }, []);

  // === Filtrar búsqueda ===
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(events);
    } else {
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

  // === Editar evento ===
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

  // === Cancelar edición ===
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

  // === Guardar cambios ===
  const handleSave = async () => {
    if (!form.title || !form.description || !form.location) {
      alert("Completa todos los campos requeridos.");
      return;
    }

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

      alert("✅ Evento actualizado correctamente.");
      handleCancel();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === Eliminar evento ===
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este evento?"
    );
    if (!confirmDelete) return;

    try {
      const session = await getSession();
      const token = session?.token;

      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al eliminar evento");
      setEvents((prev) => prev.filter((e) => e._id !== id));
      setFiltered((prev) => prev.filter((e) => e._id !== id));

      alert("✅ Evento eliminado correctamente.");
    } catch (err) {
      console.error("Error al eliminar evento:", err);
      alert(err.message);
    }
  };

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

  const handleMenuOption = (option) => {
    toggleMenu();
    if (Platform.OS === "web") alert(`Iría a: ${option}`);
    else Alert.alert("Navegación simulada", option);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons={true} />

      {/* === BARRA SUPERIOR === */}
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

        {/* === ICONO DE MENÚ QUE CAMBIA === */}
        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close-admin.png") // ✅ Nuevo icono de cerrar
                : require("../assets/iconos/menu-admin.png") // Icono normal
            }
            style={{ width: 26, height: 26 }}
          />
        </Pressable>
      </View>

      {/* === MENÚ LATERAL (solo web) === */}
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
              "Perfil",
              "Sobre nosotros",
              "Cultura e Historia",
              "Ver usuarios",
              "Contacto",
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => handleMenuOption(item)}
                style={{ marginBottom: 25 }}
              >
                <Text
                  style={{
                    color: "#014869",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </>
      )}

      {/* === CUERPO PRINCIPAL === */}
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
                justifyContent:
                  filtered.length === 0 ? "center" : "flex-start",
                alignItems: filtered.length === 0 ? "center" : "stretch",
              }}
            >
              {filtered.length > 0 ? (
                filtered.map((ev) => (
                  <View
                    key={ev._id}
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
                      onPress={() => handleEdit(ev)}
                      style={{ margin: 4 }}
                    >
                      <Text>✏️</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(ev._id)}
                      style={{ margin: 4 }}
                    >
                      <Text>🗑️</Text>
                    </Pressable>
                  </View>
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
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              Editar evento
            </Text>
            <ScrollView>
              <Text>Título:</Text>
              <TextInput
                value={form.title}
                onChangeText={(t) => setForm({ ...form, title: t })}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  height: 36,
                  marginBottom: 8,
                }}
              />

              <Text>Descripción:</Text>
              <TextInput
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  height: 80,
                  textAlignVertical: "top",
                  padding: 10,
                  marginBottom: 8,
                }}
              />

              <Text>Fecha (DD/MM/YYYY):</Text>
              <TextInput
                value={form.date}
                onChangeText={(t) => setForm({ ...form, date: t })}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  height: 36,
                  marginBottom: 8,
                }}
              />

              <Text>Hora (HH:MM):</Text>
              <TextInput
                value={form.hour}
                onChangeText={(t) => setForm({ ...form, hour: t })}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  height: 36,
                  marginBottom: 8,
                }}
              />

              <Text>Lugar:</Text>
              <TextInput
                value={form.location}
                onChangeText={(t) => setForm({ ...form, location: t })}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 10,
                  paddingHorizontal: 10,
                  height: 36,
                  marginBottom: 8,
                }}
              />

              <Text>Categoría:</Text>
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
                  borderColor: "#ccc",
                  marginBottom: 10,
                  borderRadius: 10,
                }}
                dropDownContainerStyle={{
                  borderColor: "#ccc",
                }}
              />

              {/* BOTONES */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 12,
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

      <Footer />
    </View>
  );
}
