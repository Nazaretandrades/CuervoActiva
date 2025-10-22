import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import DropDownPicker from "react-native-dropdown-picker";

const API_URL =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000/api/events"
    : "http://localhost:5000/api/events";

export default function Organizer({ navigation }) {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [search, setSearch] = useState("");
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
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("Usuario");
  const [loading, setLoading] = useState(false);

  // === Obtener token compatible con web y móvil ===
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

      if (session?.name) setUserName(session.name);
    } catch (err) {
      console.error("Error obteniendo usuario:", err);
    }
  };

  // === Cargar eventos del organizador ===
  useEffect(() => {
    fetchOrganizerEvents();
    getUserName();
  }, []);

  const fetchOrganizerEvents = async () => {
    try {
      const token = await getSessionToken();
      if (!token) {
        console.warn("⚠️ No hay token. Inicia sesión nuevamente.");
        return;
      }

      const res = await fetch(`${API_URL}/organizer`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al obtener eventos del organizador");
      const data = await res.json();
      setEvents(data);
      setFilteredEvents(data);
    } catch (err) {
      console.error("Error al cargar eventos:", err);
    }
  };

  // === Filtro de búsqueda ===
  useEffect(() => {
    if (search.trim() === "") {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(
        (ev) =>
          ev.title.toLowerCase().includes(search.toLowerCase()) ||
          ev.category.toLowerCase().includes(search.toLowerCase()) ||
          ev.location.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [search, events]);

  // === Elegir imagen local y subirla al backend ===
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        Alert.alert("Permiso denegado", "Se necesita acceso a tus fotos.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const token = await getSessionToken();

        if (!token) {
          Alert.alert(
            "Error",
            "No se encontró token. Inicia sesión nuevamente."
          );
          return;
        }

        const formData = new FormData();

        if (Platform.OS === "web") {
          const response = await fetch(uri);
          const blob = await response.blob();
          formData.append("image", blob, "imagen.jpg");
        } else {
          formData.append("image", {
            uri,
            type: "image/jpeg",
            name: "imagen.jpg",
          });
        }

        const res = await fetch("http://localhost:5000/api/events/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("Error del servidor:", errText);
          throw new Error("Error al subir la imagen");
        }

        const data = await res.json();
        setForm({ ...form, image_url: data.image_url });

        Alert.alert("✅ Imagen subida", "La imagen se subió correctamente.");
      }
    } catch (err) {
      console.error("Error al subir imagen:", err);
      Alert.alert("Error", err.message);
    }
  };

  // === Crear o editar evento ===
  const handleSubmit = async () => {
    // ✅ Función de alerta universal (sirve para web y móvil)
    const showAlert = (title, message) => {
      if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`);
      } else {
        Alert.alert(title, message);
      }
    };

    // ✅ Validar campos requeridos (incluye imagen)
    const requiredFields = [
      { key: "title", label: "Título" },
      { key: "description", label: "Descripción" },
      { key: "date", label: "Fecha" },
      { key: "hour", label: "Hora" },
      { key: "location", label: "Lugar" },
      { key: "category", label: "Categoría" },
      { key: "image_url", label: "Imagen" },
    ];

    const emptyFields = requiredFields.filter(
      (field) => !form[field.key] || form[field.key].trim() === ""
    );

    if (emptyFields.length > 0) {
      const fieldNames = emptyFields.map((f) => f.label).join(", ");
      showAlert(
        "Campos incompletos",
        `Por favor, completa los siguientes campos: ${fieldNames}.`
      );
      return;
    }

    setLoading(true);
    try {
      // 🔹 Obtener token de sesión
      const session = await getSession();
      const token = session?.token;
      if (!token) {
        showAlert("Error", "No se encontró token. Inicia sesión nuevamente.");
        return;
      }

      const method = form._id ? "PUT" : "POST";
      const url = form._id ? `${API_URL}/${form._id}` : API_URL;

      const bodyData = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date.trim(),
        hour: form.hour.trim(),
        location: form.location.trim(),
        category: form.category.trim(),
        image_url: form.image_url.trim(),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = await res.json();

      if (form._id) {
        setEvents((prev) => prev.map((e) => (e._id === data._id ? data : e)));
        showAlert("✅ Éxito", "Evento actualizado correctamente.");
      } else {
        setEvents((prev) => [...prev, data]);
        showAlert("✅ Éxito", "Evento creado correctamente.");
      }

      // 🔹 Resetear formulario
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
    } catch (err) {
      console.error("❌ Error al guardar evento:", err);
      showAlert(
        "Error",
        err.message || "Ocurrió un error al guardar el evento."
      );
    } finally {
      setLoading(false);
    }
  };

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
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons={true} />

      {/* CONTENEDOR PRINCIPAL */}
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 40,
        }}
      >
        {/* ===== Fila superior ===== */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#eee",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text>👤</Text>
            </View>
            <View>
              <Text>Organiz.</Text>
              <Text style={{ fontWeight: "600", color: "#014869" }}>
                {userName || "Usuario"}
              </Text>
            </View>
          </View>

          {/* Barra de búsqueda */}
          <TextInput
            placeholder="Buscar eventos..."
            value={search}
            onChangeText={setSearch}
            style={{
              flex: 1,
              marginLeft: 20,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingHorizontal: 12,
              height: 36,
              backgroundColor: "#fff",
              borderRadius: 20,
            }}
          />
        </View>

        {/* ===== CUERPO PRINCIPAL ===== */}
        <View style={{ flex: 1, flexDirection: "row", gap: 24 }}>
          {/* Columna izquierda */}
          {/* Columna izquierda con scroll */}
          <View
            style={{
              width: "25%",
              borderRightWidth: 1,
              borderRightColor: "#eee",
              paddingRight: 16,
            }}
          >
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
              Tus eventos
            </Text>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingBottom: 10,
              }}
              showsVerticalScrollIndicator={true}
            >
              {filteredEvents.length === 0 ? (
                <Text style={{ color: "#777", fontStyle: "italic" }}>
                  No se encontraron eventos.
                </Text>
              ) : (
                filteredEvents.map((ev) => (
                  <View
                    key={ev._id || ev.id}
                    style={{
                      borderWidth: 1,
                      borderColor: "#ddd",
                      backgroundColor: "#fff",
                      padding: 10,
                      marginBottom: 8,
                      borderRadius: 10,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text numberOfLines={1}>{ev.title}</Text>
                    <Pressable onPress={() => handleEdit(ev)}>
                      <Text>✏️</Text>
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          {/* Columna derecha */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
              {form._id ? "Editar evento" : "Crear evento"}
            </Text>

            {/* === Formulario en 2 columnas === */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {/* Columna 1 */}
              <View style={{ flex: 1, minWidth: "45%" }}>
                <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                  Título:
                </Text>
                <TextInput
                  value={form.title}
                  onChangeText={(t) => setForm({ ...form, title: t })}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    height: 36,
                    paddingHorizontal: 10,
                    marginBottom: 10,
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
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#ddd",
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
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    height: 36,
                    paddingHorizontal: 10,
                    marginBottom: 10,
                  }}
                />
              </View>

              {/* Columna 2 */}
              <View style={{ flex: 1, minWidth: "45%" }}>
                <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                  Descripción:
                </Text>
                <TextInput
                  value={form.description}
                  onChangeText={(t) => setForm({ ...form, description: t })}
                  multiline
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    height: 80,
                    padding: 10,
                    marginBottom: 10,
                    textAlignVertical: "top",
                  }}
                />

                <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                  Lugar:
                </Text>
                <TextInput
                  value={form.location}
                  onChangeText={(t) => setForm({ ...form, location: t })}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: "#ddd",
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
                    borderColor: "#ddd",
                    borderRadius: 20,
                    height: 40,
                    marginBottom: 10,
                    zIndex: 10,
                  }}
                  dropDownContainerStyle={{
                    borderColor: "#ddd",
                  }}
                />
              </View>
            </View>

            {/* Imagen */}
            <Text style={{ fontWeight: "600", marginBottom: 150 }}>
              Imagen del evento:
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 20,
                backgroundColor: "#fff",
                height: 150,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              {form.image_url ? (
                <Image
                  source={{ uri: form.image_url }}
                  style={{ width: 120, height: 120, borderRadius: 12 }}
                />
              ) : (
                <Text style={{ color: "#666" }}>Sin imagen seleccionada</Text>
              )}

              <Pressable onPress={pickImage} style={{ marginTop: 8 }}>
                <Text style={{ color: "#014869" }}>🖼️ Añadir imagen</Text>
              </Pressable>
            </View>

            {/* Botón principal */}
            <View style={{ alignItems: "center", marginTop: 10 }}>
              <Pressable
                onPress={handleSubmit}
                disabled={!!loading}
                style={{
                  backgroundColor: loading ? "#ccc" : "#F3B23F",
                  borderRadius: 25,
                  paddingVertical: 14,
                  paddingHorizontal: 40,
                  shadowColor: "#000",
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}
                >
                  {loading
                    ? "Guardando..."
                    : form._id
                    ? "Guardar cambios"
                    : "Crear evento"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {Platform.OS === "web" && <Footer />}
    </View>
  );
}
