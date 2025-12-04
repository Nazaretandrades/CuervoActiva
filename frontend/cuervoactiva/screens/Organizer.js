import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Platform,
  ScrollView,
  Animated,
  FlatList,
  Dimensions,
  Modal,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000/api/events"
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

  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerColor, setBannerColor] = useState("#33ADB5");
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  /* ---------- Responsive web (como Admin) ---------- */
  const [winWidth, setWinWidth] = useState(
    Platform.OS === "web" ? window.innerWidth : Dimensions.get("window").width
  );

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isWeb = Platform.OS === "web";

  const isMobileWeb = isWeb && winWidth < 768;
  const isTabletWeb = isWeb && winWidth >= 768 && winWidth < 1024;
  const isLaptopWeb = isWeb && winWidth >= 1024 && winWidth < 1440;
  const isLargeWeb = isWeb && winWidth >= 1440;

  const showFooterFixed = isLaptopWeb || isLargeWeb;

  const searchBarWidth = isWeb
    ? isMobileWeb
      ? "100%"
      : isTabletWeb
      ? 420
      : 700
    : "45%";

  const listMaxHeight = isMobileWeb ? 260 : isTabletWeb ? 400 : 500;

  const showTwoColumns = !isWeb ? true : !isMobileWeb;

  // Modal del formulario SOLO en web móvil
  const [formModalVisible, setFormModalVisible] = useState(false);

  const showBanner = (msg, color = "#33ADB5") => {
    setBannerMessage(msg);
    setBannerColor(color);
    Animated.timing(bannerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(bannerOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => setBannerMessage(""));
      }, 2500);
    });
  };

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
    } catch {
      return null;
    }
  };

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

  useEffect(() => {
    fetchOrganizerEvents();
    getUserName();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchOrganizerEvents();
    }, [])
  );

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
      showBanner("⚠️ No se pudieron cargar tus eventos", "#e74c3c");
    }
  };

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

  const handleEdit = (ev) => {
    setForm(ev);
    if (isWeb && isMobileWeb) {
      setFormModalVisible(true);
    }
  };

  const openCreateModal = () => {
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
    if (isWeb && isMobileWeb) {
      setFormModalVisible(true);
    }
  };

  const goToEventDetail = (eventId) =>
    navigation.navigate("OrganizerEventDetail", { eventId });
  const goToNotifications = () => navigation.navigate("OrganizerNotifications");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToProfile = () => navigation.navigate("OrganizerProfile");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToAbout = () => navigation.navigate("SobreNosotros");
  const goToAddEvent = () => navigation.navigate("AddEvent");
  const goToEditEvent = (event) => {
    navigation.navigate("EditEvent", { eventData: event });
  };

  const renderTopBar = () => {
    const topBarStyle = {
      flexDirection: isMobileWeb ? "column" : "row",
      alignItems: isMobileWeb ? "flex-start" : "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: isMobileWeb ? 12 : 14,
      gap: isMobileWeb ? 14 : 0,
      backgroundColor: "#fff",
    };

    return (
      <View style={topBarStyle}>
        {/* IZQUIERDA: avatar + nombre */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              position: "relative",
              marginRight: 12,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#F3B23F",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 24, height: 24, tintColor: "#fff" }}
            />

            <Image
              source={require("../assets/iconos/lapiz.png")}
              style={{
                position: "absolute",
                top: -6,
                left: -6,
                width: 20,
                height: 20,
                resizeMode: "contain",
                transform: [{ rotate: "-20deg" }],
              }}
            />
          </View>

          <View>
            <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
              Organiz.
            </Text>
            <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
          </View>
        </View>

        {/* CENTRO: BUSCADOR (se mueve en móvil) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#F3B23F",
            borderRadius: 3,
            paddingHorizontal: 10,
            backgroundColor: "#fff",
            width: searchBarWidth,
            height: 36,
            marginTop: isMobileWeb ? 6 : 0,
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
            }}
          />
          <Image
            source={require("../assets/iconos/search-organizador.png")}
            style={{ width: 16, height: 16, tintColor: "#F3B23F" }}
          />
        </View>

        {/* DERECHA: ICONOS (se bajan en móvil web) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: isMobileWeb ? 2 : 0,
            gap: 16,
          }}
        >
          <Pressable onPress={goToNotifications}>
            <Image
              source={require("../assets/iconos/bell3.png")}
              style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
            />
          </Pressable>

          {Platform.OS === "web" && (
            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar-organizador.png")}
                style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
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
              style={{ width: 24, height: 24, tintColor: "#F3B23F" }}
            />
          </Pressable>
        </View>
      </View>
    );
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

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        showBanner("⚠️ Se necesita acceso a tus fotos", "#e67e22");
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
          showBanner("❌ Sesión no encontrada", "#e74c3c");
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
        showBanner("🖼️ Imagen subida correctamente", "#33ADB5");
      }
    } catch (err) {
      console.error("❌ Error al subir imagen:", err);
      showBanner("❌ Error al subir la imagen", "#e74c3c");
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showBanner("El título es obligatorio", "#e67e22");
      return;
    }

    if (!form.description.trim()) {
      showBanner("La descripción es obligatoria", "#e67e22");
      return;
    }

    if (!form.date.trim()) {
      showBanner("La fecha es obligatoria", "#e67e22");
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.date)) {
      showBanner("La fecha debe tener formato DD/MM/YYYY", "#e67e22");
      return;
    }

    if (!form.hour.trim()) {
      showBanner("La hora es obligatoria", "#e67e22");
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(form.hour)) {
      showBanner("La hora debe tener formato HH:MM", "#e67e22");
      return;
    }

    if (!form.location.trim()) {
      showBanner("La ubicación es obligatoria", "#e67e22");
      return;
    }

    if (!form.category.trim()) {
      showBanner("La categoría es obligatoria", "#e67e22");
      return;
    }

    if (!form.image_url.trim()) {
      showBanner("Debes añadir una imagen", "#e67e22");
      return;
    }

    setLoading(true);
    try {
      const token = await getSessionToken();
      if (!token) {
        showBanner("❌ Sesión no encontrada", "#e74c3c");
        return;
      }

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
      showBanner(
        form._id
          ? "✏️ Cambios guardados correctamente"
          : "🎉 Evento creado con éxito",
        "#2ecc71"
      );
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
      if (isWeb && isMobileWeb) {
        setFormModalVisible(false);
      }
    } catch {
      showBanner("❌ No se pudo guardar el evento", "#e74c3c");
    } finally {
      setLoading(false);
    }
  };

  // === FORMULARIO REUTILIZABLE (web) ===
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

      {/* CAMPOS SUPERIORES */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <View style={{ flex: 1, minWidth: showTwoColumns ? "45%" : "100%" }}>
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 4,
              color: "#014869",
            }}
          >
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

        {/* DESCRIPCIÓN + LUGAR */}
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

      {/* CATEGORÍA */}
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

      {/* IMAGEN */}
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

      {/* BOTONES */}
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
        {form._id && (
          <Pressable
            onPress={() =>
              setForm({
                _id: null,
                title: "",
                description: "",
                date: "",
                hour: "",
                location: "",
                category: "deporte",
                image_url: "",
              })
            }
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

  // === RENDER MÓVIL NATIVO (NO TOCADO) ===
  if (Platform.OS !== "web") {
    return (
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <Header hideAuthButtons />
        {renderTopBar()}

        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 20,
            marginTop: 50,
            height: 700,
          }}
        >
          <Text
            style={{
              fontWeight: "700",
              fontSize: 16,
              color: "#014869",
              marginBottom: 10,
            }}
          >
            Listado de eventos
          </Text>

          {filteredEvents.length === 0 ? (
            <Text style={{ color: "#777", fontStyle: "italic" }}>
              No tienes eventos todavía.
            </Text>
          ) : (
            <FlatList
              data={filteredEvents}
              keyExtractor={(item) => item._id || item.id}
              showsVerticalScrollIndicator={false}
              style={{
                maxHeight: 300,
              }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => goToEventDetail(item._id)}
                  style={{
                    backgroundColor: "#014869",
                    borderRadius: 8,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: "600",
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      goToEditEvent(item);
                    }}
                  >
                    <Image
                      source={require("../assets/iconos/editar.png")}
                      style={{
                        width: 18,
                        height: 18,
                        transform: [{ rotate: "-20deg" }],
                      }}
                    />
                  </Pressable>
                </Pressable>
              )}
            />
          )}
        </View>

        <Pressable
          onPress={goToAddEvent}
          style={{
            position: "absolute",
            bottom: 25,
            right: 25,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            elevation: 8,
          }}
        >
          <Image
            source={require("../assets/iconos/add-organizador.png")}
            style={{ width: 36, height: 36 }}
          />
        </Pressable>

        {menuVisible && (
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
                style={{ fontSize: 18, fontWeight: "bold", color: "#F3B23F" }}
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
                    style={{ width: 16, height: 16, tintColor: "#F3B23F" }}
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
        )}

        {bannerMessage !== "" && (
          <Animated.View
            style={{
              opacity: bannerOpacity,
              position: "absolute",
              bottom: 30,
              left: "50%",
              transform: [{ translateX: -150 }],
              width: 300,
              backgroundColor: bannerColor,
              paddingVertical: 14,
              alignItems: "center",
              borderRadius: 25,
              shadowColor: "#000",
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 10,
              zIndex: 200,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              {bannerMessage}
            </Text>
          </Animated.View>
        )}
      </View>
    );
  }

  // === RENDER WEB RESPONSIVE (como Admin) ===
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
      {renderTopBar()}

      {Platform.OS === "web" && menuVisible && (
        <>
          {/* OVERLAY OSCURO PARA CERRAR AL HACER CLIC FUERA */}
          <Pressable
            onPress={toggleMenu}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 5,
            }}
          />

          {/* MENÚ LATERAL */}
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

      {/* CUERPO PRINCIPAL WEB RESPONSIVE */}
      <View
        style={{
          flex: 1,
          padding: 16,
          paddingTop: isLaptopWeb ? 40 : isLargeWeb ? 20 : 60,
          backgroundColor: "#f5f6f7",
          paddingBottom: showFooterFixed ? 110 : 40,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: showTwoColumns ? "row" : "column",
            justifyContent: "space-between",
          }}
        >
          {/* LISTADO IZQUIERDA */}
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
            <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
              Tus eventos
            </Text>
            <ScrollView
              style={{
                maxHeight: listMaxHeight,
              }}
              contentContainerStyle={{ paddingBottom: isLaptopWeb ? 150 : 20 }}
              showsVerticalScrollIndicator={true}
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
                      <Image
                        source={require("../assets/iconos/editar.png")}
                        style={{
                          width: 20,
                          height: 20,
                          tintColor: "#F3B23F",
                          transform: [{ rotate: "-15deg" }],
                        }}
                      />
                    </Pressable>
                  </Pressable>
                ))
              )}
            </ScrollView>

            {/* BOTÓN CREAR EVENTO SOLO EN MÓVIL WEB */}
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

          {/* FORMULARIO DERECHA SOLO NO-MÓVIL WEB */}
          {!isMobileWeb && (
            <ScrollView
              style={{
                flex: 1,
                paddingHorizontal: showTwoColumns ? 16 : 0,
                marginTop: isLaptopWeb ? -30 : isLargeWeb ? -10 : 0,
              }}
              contentContainerStyle={{ paddingBottom: isLaptopWeb ? 300 : 200 }}
            >
              {renderFormContent()}
            </ScrollView>
          )}
        </View>
      </View>

      {/* MODAL FORMULARIO SOLO MÓVIL WEB */}
      {isWeb && isMobileWeb && (
        <Modal
          transparent
          visible={formModalVisible}
          animationType="slide"
          onRequestClose={() => {
            setFormModalVisible(false);
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

      {/* FOOTER SOLO EN WEB LAPTOP/DESKTOP (FIJO) */}
      {isWeb && showFooterFixed && (
        <View
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
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

      {/* BANNER WEB */}
      {bannerMessage !== "" && (
        <Animated.View
          style={{
            opacity: bannerOpacity,
            position: "fixed",
            bottom: 30,
            left: "50%",
            transform: [{ translateX: -150 }],
            width: 300,
            backgroundColor: bannerColor,
            paddingVertical: 14,
            alignItems: "center",
            borderRadius: 25,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 10,
            zIndex: 200,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            {bannerMessage}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
