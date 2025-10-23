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
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

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
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        form._id ? prev.map((e) => (e._id === data._id ? data : e)) : [...prev, data]
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

  // === Menú ===
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

  const simulateNavigation = (route) => {
    toggleMenu();
    Platform.OS === "web"
      ? alert(`Iría a: ${route}`)
      : Alert.alert("Navegación simulada", route);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* === BARRA SUPERIOR (única) === */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text>👤</Text>
          <Text style={{ fontWeight: "600", color: "#014869" }}>{userName}</Text>
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

        <Pressable onPress={toggleMenu}>
          <Image
            source={require("../assets/iconos/menu-usuario.png")}
            style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
          />
        </Pressable>
      </View>

      {/* === MENÚ === */}
      {Platform.OS === "web" ? (
        <>
          {menuVisible && (
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
          )}
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
            {["Perfil", "Sobre nosotros", "Cultura e Historia", "Contacto"].map(
              (item, i) => (
                <Pressable
                  key={i}
                  onPress={() => simulateNavigation(item)}
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
              )
            )}
          </Animated.View>
        </>
      ) : (
        menuVisible && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#f8f8f8",
              zIndex: 20,
              paddingHorizontal: 24,
              paddingTop: 60,
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
                  style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
                />
              </Pressable>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#F3B23F",
                  textAlign: "center",
                  flex: 1,
                }}
              >
                Menú
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              {[
                {
                  label: "Sobre nosotros",
                  icon: require("../assets/iconos/info-usuario.png"),
                },
                {
                  label: "Cultura e Historia",
                  icon: require("../assets/iconos/museo-usuario.png"),
                },
                {
                  label: "Contacto",
                  icon: require("../assets/iconos/phone-usuario.png"),
                },
              ].map((item, i) => (
                <Pressable
                  key={i}
                  onPress={() => simulateNavigation(item.label)}
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
                        width: 24,
                        height: 24,
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
                    style={{ width: 18, height: 18, tintColor: "#F3B23F" }}
                  />
                </Pressable>
              ))}
            </View>

            {/* Barra inferior */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: "#F3B23F33",
                paddingVertical: 14,
              }}
            >
              <Image
                source={require("../assets/iconos/search.png")}
                style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
              />
              <Image
                source={require("../assets/iconos/calendar.png")}
                style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
              />
              <Image
                source={require("../assets/iconos/user.png")}
                style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
              />
            </View>
          </View>
        )
      )}

      {/* === FORMULARIO === */}
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
        {/* COLUMNA IZQUIERDA + FORMULARIO */}
        <View style={{ flex: 1, flexDirection: "row", gap: 24 }}>
          {/* Izquierda */}
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

          {/* Derecha */}
          <View style={{ flex: 1 }}>
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
              <View style={{ flex: 1, minWidth: "45%" }}>
                <Text style={{ fontWeight: "600", marginBottom: 4 }}>
                  Descripción:
                </Text>
                <TextInput
                  value={form.description}
                  onChangeText={(t) =>
                    setForm({ ...form, description: t })
                  }
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
                  onChangeText={(t) =>
                    setForm({ ...form, location: t })
                  }
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
          </View>
        </View>
      </View>

      {Platform.OS === "web" && <Footer />}
    </View>
  );
}
