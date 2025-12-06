// Pantalla Home del Administrador
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
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import DropDownPicker from "react-native-dropdown-picker";
import { getSession } from "../services/sessionManager";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
// URL local según plataforma
const LOCAL_API =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://localhost:5000";

// API final: en desarrollo usa LOCAL_API, en producción EXPO_PUBLIC_API_URL
const BACKEND_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  LOCAL_API;

const API_URL = `${BACKEND_URL}/api/events`;

// Se declara el componente
export default function Admin() {
  // Estados
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
  const navigation = useNavigation();
  const [hoveredId, setHoveredId] = useState(null);
  const bottomSafeArea = Platform.OS === "web" ? 110 : 0;

  // Responsive en web
  const [winWidth, setWinWidth] = useState(
    Platform.OS === "web" ? window.innerWidth : Dimensions.get("window").width
  );

  // Se redimensiona en tiempo real
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Breakpoints web
  const isWeb = Platform.OS === "web";
  const isMobileWeb = isWeb && winWidth < 768; 
  const isTabletWeb = isWeb && winWidth >= 768 && winWidth < 1024;
  const isLaptopWeb = isWeb && winWidth >= 1024 && winWidth < 1440;
  const isLargeWeb = isWeb && winWidth >= 1440;
  // Footer fijo solo en laptop/desktop
  const showFooterFixed = isLaptopWeb || isLargeWeb;
  // Anchos / alturas responsive
  const searchBarWidth = isWeb
    ? isMobileWeb
      ? "100%"
      : isTabletWeb
      ? 420
      : 700
    : "60%";
  const listMaxHeight = isMobileWeb ? 260 : isTabletWeb ? 400 : 500;
  const showTwoColumns = !isWeb ? true : !isMobileWeb;

  // Mostrar el toast
  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });
    setTimeout(
      () => setToast({ visible: false, message: "", type: "info" }),
      2500
    );
  };

  // Cargar eventos
  useEffect(() => {
    const loadData = async () => {
      // Obtiene la sesión del usuario (Admin)
      const session = await getSession();
      if (session?.name) setAdminName(session.name);

      try {
        // Obtiene el token
        const token = session?.token;
        // Hace el fetch
        const res = await fetch(API_URL, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        // Obtiene la respuesta (los eventos)
        if (!res.ok) throw new Error("Error al obtener eventos");
        const data = await res.json();
        // Establece los eventos
        setEvents(data);
        // Filtra los eventos
        setFiltered(data);
      } catch (err) {
        console.error(err);
        showToast("❌ No se pudieron cargar los eventos.", "error");
      }
    };
    loadData();
  }, []);

  // Buscador con filtrado dinámico
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

  // Modal del formulario SOLO en móvil web
  const [formModalVisible, setFormModalVisible] = useState(false);
  // Estado del formulario modal
  const resetForm = () => {
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
  // Función para abrir el modal
  const openCreateModal = () => {
    setEditing(false);
    resetForm();
    if (isMobileWeb) setFormModalVisible(true);
  };
  // Función para editar el formulario
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
    if (isMobileWeb) setFormModalVisible(true); // En móvil se abre modal al editar
  };

  // Función para cancelar la edición
  const handleCancel = () => {
    setEditing(false);
    resetForm();
    if (isMobileWeb) setFormModalVisible(false); //  En móvil cerramos modal
  };

  // Subir imagen
  const pickImage = async () => {
    try {
      // Pide permisos
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        showToast("⚠️ Se necesita acceso a tus fotos", "warning");
        return;
      }
      // Abre la galería
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        const session = await getSession();
        const token = session?.token;
        if (!token) {
          showToast("❌ Sesión no encontrada", "error");
          return;
        }

        // La envía como FromData al backend
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

        // Hace el post
        const res = await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        // Recibe la respuesta
        if (!res.ok) throw new Error("Error al subir la imagen");
        const data = await res.json();
        setForm((prev) => ({ ...prev, image_url: data.image_url }));
        showToast("🖼️ Imagen subida correctamente", "success");
      }
    } catch (err) {
      console.error("❌ Error al subir imagen:", err);
      showToast("❌ Error al subir la imagen", "error");
    }
  };

  // Crear / editar (Función para subir)
  const handleSubmit = async () => {
    // Comprueba los campos
    if (!form.title.trim())
      return showToast("El título es obligatorio", "warning");
    if (!form.description.trim())
      return showToast("La descripción es obligatoria", "warning");
    if (!form.date.trim())
      return showToast("La fecha es obligatoria", "warning");
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.date))
      return showToast("Fecha debe ser DD/MM/YYYY", "warning");
    if (!form.hour.trim())
      return showToast("La hora es obligatoria", "warning");
    if (!/^\d{2}:\d{2}$/.test(form.hour))
      return showToast("Hora debe ser HH:MM", "warning");
    if (!form.location.trim())
      return showToast("La ubicación es obligatoria", "warning");
    if (!form.category.trim())
      return showToast("La categoría es obligatoria", "warning");
    if (!form.image_url.trim())
      return showToast("Debes añadir una imagen", "warning");
    setLoading(true);
    try {
      // Obtengo la sesión y el token
      const session = await getSession();
      const token = session?.token;
      if (!token) return showToast("❌ Sesión no encontrada", "error");

      // Según el método es Actualizar o Postear
      const method = form._id ? "PUT" : "POST";
      const url = form._id ? `${API_URL}/${form._id}` : API_URL;

      // Hago el fetch
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      // Obtengo la respuesta
      if (!res.ok) throw new Error("Error al guardar evento");
      const data = await res.json();

      // Actualizo los estados locales
      setEvents((prev) =>
        form._id
          ? prev.map((e) => (e._id === data._id ? data : e))
          : [...prev, data]
      );
      setFiltered((prev) =>
        form._id
          ? prev.map((e) => (e._id === data._id ? data : e))
          : [...prev, data]
      );
      // Muestro el toast
      showToast(
        form._id ? "✏️ Cambios guardados" : "🎉 Evento creado",
        "success"
      );
      // Reseteo el formulario
      resetForm();
      setEditing(false);
      if (isMobileWeb) setFormModalVisible(false); //  cerrar modal en móvil
    } catch (err) {
      console.error(err);
      showToast("❌ No se pudo guardar", "error");
    } finally {
      setLoading(false);
    }
  };

  // Función para confirmar el eliminar
  const confirmDelete = (id) => {
    setEventToDelete(id);
    setModalVisible(true);
  };

  // Función para el botón de eliminar
  const handleDeleteConfirmed = async () => {
    setModalVisible(false);
    if (!eventToDelete) return;

    try {
      // Obtengo la sesión y el token
      const session = await getSession();
      const token = session?.token;

      // Hago el fetch
      const res = await fetch(`${API_URL}/${eventToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Obtengo la respuesta
      if (!res.ok) throw new Error("Error al eliminar");

      // Los elimino
      setEvents((prev) => prev.filter((e) => e._id !== eventToDelete));
      setFiltered((prev) => prev.filter((e) => e._id !== eventToDelete));
      // Muestro el toast
      showToast("✅ Evento eliminado", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ No se pudo eliminar", "error");
    } finally {
      setEventToDelete(null);
    }
  };

  // Navegaciones a las distintas pantallas
  const goToProfile = () => navigation.navigate("AdminProfile");
  const goToNotifications = () => navigation.navigate("AdminNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");

  // Menú lateral animado (web)
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

  // Contenido del formulario (desktop + modal móvil)
  const renderFormContent = () => (
    <>
      <Text
        style={{
          fontWeight: "bold",
          marginBottom: 14,
          fontSize: 18,
          color: "#02486b",
          textAlign: "left",
        }}
      ></Text>

      {/* Campos superiores */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <View style={{ flex: 1, minWidth: showTwoColumns ? "45%" : "100%" }}>
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 4,
              color: "#014869",
            }}
          >
            {/* Título */}
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

          {/* Fecha */}
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 4,
              color: "#014869",
            }}
          >
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
          {/* Hora */}
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 4,
              color: "#014869",
            }}
          >
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

        {/* Descripción + Lugar */}
        <View style={{ flex: 1, minWidth: showTwoColumns ? "45%" : "100%" }}>
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 4,
              color: "#014869",
            }}
          >
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

          <Text
            style={{
              fontWeight: "600",
              marginBottom: 4,
              color: "#014869",
            }}
          >
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
        </View>
      </View>

      {/* Categoría */}
      <Text
        style={{
          fontWeight: "600",
          marginBottom: 4,
          color: "#014869",
        }}
      >
        Categoría:
      </Text>

      <View style={{ zIndex: 9999 }}>
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
          setValue={(cb) =>
            setForm((prev) => ({ ...prev, category: cb(prev.category) }))
          }
          style={{
            backgroundColor: "#fff",
            borderColor: "#ddd",
            borderRadius: 20,
            height: 40,
            marginBottom: open ? 200 : 10,
          }}
          dropDownContainerStyle={{
            borderColor: "#ddd",
            zIndex: 9999,
            elevation: 20,
          }}
        />
      </View>

      {/* Imagen */}
      <Text
        style={{
          fontWeight: "600",
          color: "#014869",
        }}
      >
        Imagen del evento:
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 20,
          backgroundColor: "#fff",
          height: 120,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 8,
          marginBottom: 20,
        }}
      >
        {form.image_url ? (
          <Image
            source={{ uri: form.image_url }}
            style={{
              width: 90,
              height: 90,
              borderRadius: 10,
            }}
          />
        ) : (
          <Text style={{ color: "#666" }}>Sin imagen seleccionada</Text>
        )}

        <Pressable onPress={pickImage}>
          <Text style={{ color: "#014869", fontSize: 13 }}>
            🖼️ Añadir imagen
          </Text>
        </Pressable>
      </View>

      {/* Botones */}
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 12,
          flexWrap: "wrap",
          marginTop: isTabletWeb
            ? -10
            : isLaptopWeb
            ? -10
            : isLargeWeb
            ? -5
            : 10,
        }}
      >
        {editing && (
          <Pressable
            onPress={handleCancel}
            disabled={!!loading}
            style={{
              backgroundColor: "#ccc",
              borderRadius: 25,
              paddingVertical: 12,
              paddingHorizontal: 24,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <Text
              style={{
                color: "#333",
                fontWeight: "600",
                fontSize: 14,
                paddingVertical: 2,
                paddingHorizontal: 2,
              }}
            >
              Cancelar edición
            </Text>
          </Pressable>
        )}

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
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* Encabezado Admin */}
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

        {/* Buscador */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#0094A2",
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
            source={require("../assets/iconos/search-admin.png")}
            style={{ width: 16, height: 16, tintColor: "#0094A2" }}
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

      {/* Menú lateral web */}
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

      {/* Cuerpo principal */}
      <View
        style={{
          flex: 1,
          padding: 16,
          paddingTop: isLaptopWeb ? 40 : isLargeWeb ? 20 : 60,
          backgroundColor: "#f5f6f7",
          paddingBottom: bottomSafeArea,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: showTwoColumns ? "row" : "column",
            justifyContent: "space-between",
          }}
        >
          {/* Listado eventos izquierda */}
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
            {filtered.length > 0 && (
              <Text
                style={{
                  fontWeight: "bold",
                  marginBottom: 12,
                  color: "#02486b",
                  fontSize: 16,
                }}
              >
                Listado de eventos:
              </Text>
            )}

            <ScrollView
              style={{
                maxHeight: listMaxHeight,
                paddingBottom: isLaptopWeb ? 150 : 20,
              }}
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
                    // Cuando le pulsas a un evento, te lleva al detalle
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

            {/* Botón Crear evento solo en móvil web */}
            {isMobileWeb && (
              <View style={{ marginTop: 16, alignItems: "center" }}>
                <Pressable
                  onPress={openCreateModal}
                  style={{
                    backgroundColor: "#F3B23F",
                    borderRadius: 25,
                    paddingVertical: 10,
                    paddingHorizontal: 24,
                    shadowColor: "#000",
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    + Crear evento
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Formulario derecha*/}
          {!isMobileWeb && (
            <ScrollView
              style={{
                flex: 1,
                paddingHorizontal: showTwoColumns ? 16 : 0,
                marginTop: isLaptopWeb ? -30 : isLargeWeb ? -10 : 0,
              }}
              contentContainerStyle={{
                paddingBottom: isLaptopWeb ? 300 : 200,
              }}
            >
              {renderFormContent()}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Modal formulario solo en móvil web */}
      {isMobileWeb && (
        <Modal
          transparent
          visible={formModalVisible}
          animationType="slide"
          onRequestClose={() => {
            setFormModalVisible(false);
            setEditing(false);
            resetForm();
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <View
              style={{
                width: "100%",
                maxHeight: "85%",
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#02486b",
                  }}
                >
                  {form._id ? "Editar evento" : "Crear evento"}
                </Text>
                <Pressable
                  onPress={() => {
                    setFormModalVisible(false);
                    setEditing(false);
                    resetForm();
                  }}
                >
                  <Text style={{ fontSize: 18, color: "#02486b" }}>✕</Text>
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {renderFormContent()}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Modal eliminar */}
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

      {/* Toast */}
      {toast.visible && (
        <Animated.View
          style={{
            position: "fixed",
            bottom: 120,
            left: "50%",
            transform: [{ translateX: -150 }],
            width: 300,
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

      {/* Footer */}
      {isWeb && showFooterFixed && (
        <View style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
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
