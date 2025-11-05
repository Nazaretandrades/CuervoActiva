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
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";

const API_URL =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000/api/events"
    : "http://localhost:5000/api/events";

export default function Organizer() {
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
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  const navigation = useNavigation();

  // === Obtener token ===
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

  // === Obtener usuario logueado ===
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

  // === Cargar eventos ===
  useEffect(() => {
    fetchOrganizerEvents();
    getUserName();
  }, []);

  const fetchOrganizerEvents = async () => {
    try {
      const token = await getSessionToken();
      if (!token) return;
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

  // === Filtro búsqueda ===
  useEffect(() => {
    if (search.trim() === "") setFilteredEvents(events);
    else {
      const filtered = events.filter(
        (ev) =>
          ev.title.toLowerCase().includes(search.toLowerCase()) ||
          ev.category.toLowerCase().includes(search.toLowerCase()) ||
          ev.location.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [search, events]);

  // === Elegir imagen ===
  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
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
          Alert.alert("Error", "No se encontró token.");
          return;
        }

        const formData = new FormData();
        if (Platform.OS === "web") {
          const blob = await (await fetch(uri)).blob();
          formData.append("image", blob, "imagen.jpg");
        } else {
          formData.append("image", {
            uri,
            type: "image/jpeg",
            name: "imagen.jpg",
          });
        }

        const res = await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) throw new Error("Error al subir la imagen");
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
    const showAlert = (t, m) =>
      Platform.OS === "web" ? alert(`${t}\n\n${m}`) : Alert.alert(t, m);

    const required = [
      "title",
      "description",
      "date",
      "hour",
      "location",
      "category",
      "image_url",
    ];
    const missing = required.filter((f) => !form[f]?.trim());
    if (missing.length > 0)
      return showAlert("Campos incompletos", `Completa: ${missing.join(", ")}`);

    setLoading(true);
    try {
      const token = await getSessionToken();
      if (!token) return showAlert("Error", "Token no encontrado.");

      const method = form._id ? "PUT" : "POST";
      const url = form._id ? `${API_URL}/${form._id}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al guardar evento");
      const data = await res.json();
      setEvents((prev) =>
        form._id
          ? prev.map((e) => (e._id === data._id ? data : e))
          : [...prev, data]
      );
      showAlert("✅ Éxito", "Evento guardado correctamente.");
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
      console.error("Error:", err);
      showAlert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (ev) => setForm(ev);
  const goToEventDetail = (eventId) =>
    navigation.navigate("OrganizerEventDetail", { eventId });
  const goToNotifications = () => navigation.navigate("OrganizerNotifications");
  const goToCalendar = () => navigation.navigate("Calendar");

  // === Navegación general ===
  const goToProfile = () => navigation.navigate("OrganizerProfile");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToAbout = () => navigation.navigate("SobreNosotros");

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
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Header hideAuthButtons />

      {/* === BARRA SUPERIOR === */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: "#eee",
          zIndex: 1,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text>👤</Text>
          <Text style={{ fontWeight: "600", color: "#014869" }}>
            {userName}
          </Text>
        </View>

        <TextInput
          placeholder="Buscar eventos..."
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,
            marginHorizontal: 20,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 20,
            paddingHorizontal: 12,
            height: 36,
          }}
        />

        {/* === ICONO CALENDARIO === */}
        <Pressable onPress={goToCalendar} style={{ marginRight: 14 }}>
          <Image
            source={require("../assets/iconos/calendar-organizador.png")}
            style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
          />
        </Pressable>

        {/* === ICONO NOTIFICACIONES === */}
        <Pressable onPress={goToNotifications} style={{ marginRight: 10 }}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
          />
        </Pressable>

        <Pressable onPress={toggleMenu}>
          <Image
            source={
              Platform.OS === "web" && menuVisible
                ? require("../assets/iconos/close-organizador.png")
                : require("../assets/iconos/menu-usuario.png")
            }
            style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
          />
        </Pressable>
      </View>

      {/* === MENÚ WEB === */}
      {Platform.OS === "web" && menuVisible && (
        <>
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.1)",
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
              { label: "Política y Privacidad", action: goToPrivacy },
              { label: "Condiciones", action: goToConditions },
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
      )}

      {/* === CONTENIDO PRINCIPAL === */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 40,
          overflow: "hidden",
        }}
      >
        {/* === Lista de eventos === */}
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
            contentContainerStyle={{ paddingBottom: 10 }}
            showsVerticalScrollIndicator
          >
            {filteredEvents.length === 0 ? (
              <Text style={{ color: "#777", fontStyle: "italic" }}>
                No se encontraron eventos.
              </Text>
            ) : (
              filteredEvents.map((ev) => (
                <Pressable
                  key={ev._id || ev.id}
                  onPress={() => goToEventDetail(ev._id)}
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
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEdit(ev);
                    }}
                  >
                    <Text>✏️</Text>
                  </Pressable>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {/* === Formulario (scrollable) === */}
        <ScrollView
          style={{
            flex: 1,
            paddingHorizontal: 16,
            overflow: "visible",
          }}
          contentContainerStyle={{
            paddingBottom: 120, // deja espacio extra para el footer
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator
        >
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            {form._id ? "Editar evento" : "Crear evento"}
          </Text>

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
            <View
              style={{
                flex: 1,
                minWidth: "45%",
                position: "relative",
                overflow: "visible",
                zIndex: open ? 9999 : 1,
              }}
            >
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

              <Text style={{ fontWeight: "600", marginBottom: 4 }}>Lugar:</Text>
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
                  zIndex: 9999,
                }}
                dropDownContainerStyle={{
                  borderColor: "#ddd",
                  zIndex: 9999,
                  elevation: 20,
                  overflow: "visible",
                  position: "absolute",
                }}
              />
            </View>
          </View>

          {/* Imagen */}
          <Text style={{ fontWeight: "600", marginTop: 135 }}>
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

          {/* Botón */}
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
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                {loading
                  ? "Guardando..."
                  : form._id
                  ? "Guardar cambios"
                  : "Crear evento"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      {/* === FOOTER FIJO === */}
      {Platform.OS === "web" && (
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
