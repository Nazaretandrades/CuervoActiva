import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";
const API_URL = `${API_BASE}/api/events`;
const FAVORITES_URL = `${API_BASE}/api/favorites`;

export default function User() {
  const [userName, setUserName] = useState("Usuario");
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState([]);

  // === Obtener token multiplataforma ===
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

      console.log("🟢 Sesión detectada en User.js:", session);

      // ✅ Verificamos ambos formatos posibles de sesión
      if (session?.user?.name) {
        setUserName(session.user.name);
      } else if (session?.name) {
        setUserName(session.name);
      } else if (session?.user?.username) {
        setUserName(session.user.username);
      } else if (session?.username) {
        setUserName(session.username);
      } else if (session?.user?.email) {
        setUserName(session.user.email.split("@")[0]);
      } else if (session?.email) {
        setUserName(session.email.split("@")[0]);
      } else {
        setUserName("Invitado");
      }
    } catch (err) {
      console.error("Error obteniendo usuario:", err);
      setUserName("Invitado");
    }
  };

  // === Cargar eventos y favoritos ===
  useEffect(() => {
    const loadData = async () => {
      try {
        await getUserName();
        const token = await getSessionToken();

        // 🔹 Cargar eventos públicos
        const resEvents = await fetch(API_URL);
        if (!resEvents.ok) throw new Error("Error al obtener eventos");
        const dataEvents = await resEvents.json();
        setEvents(dataEvents);
        setFiltered(dataEvents);

        // 🔹 Cargar favoritos del usuario autenticado
        if (token) {
          const resFav = await fetch(FAVORITES_URL, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (resFav.ok) {
            const favs = await resFav.json();
            setFavorites(favs.map((f) => f._id));
          }
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
        if (Platform.OS === "web")
          alert("❌ No se pudieron cargar los eventos o favoritos.");
        else Alert.alert("Error", "No se pudieron cargar los eventos.");
      }
    };

    loadData();
  }, []);

  // === Filtrar búsqueda + categoría ===
  useEffect(() => {
    let data = events;

    if (selectedCategory !== "all") {
      data = data.filter((e) => e.category === selectedCategory);
    }

    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter(
        (e) =>
          e.title?.toLowerCase().includes(term) ||
          e.location?.toLowerCase().includes(term) ||
          e.category?.toLowerCase().includes(term)
      );
    }

    setFiltered(data);
  }, [search, selectedCategory, events]);

  // === Agregar o quitar favorito (instantáneo) ===
  const toggleFavorite = async (eventId) => {
    try {
      const token = await getSessionToken();
      if (!token) throw new Error("Sesión no válida");

      const normalizedId = String(eventId);
      const currentlyFavorite = favorites.includes(normalizedId);

      // Actualización instantánea
      setFavorites((prev) =>
        currentlyFavorite
          ? prev.filter((id) => id !== normalizedId)
          : [...prev, normalizedId]
      );

      // Petición al backend
      const res = await fetch(`${FAVORITES_URL}/${normalizedId}`, {
        method: currentlyFavorite ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al actualizar favoritos");

      // Refrescar favoritos desde el backend
      const updatedRes = await fetch(FAVORITES_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (updatedRes.ok) {
        const updatedFavs = await updatedRes.json();
        setFavorites(updatedFavs.map((f) => String(f._id)));
      }
    } catch (err) {
      console.error("❌ Error al cambiar favorito:", err);
    }
  };

  // === Botón de categoría ===
  const CategoryButton = ({ label, value, color }) => (
    <Pressable
      onPress={() => setSelectedCategory(value)}
      style={{
        backgroundColor: selectedCategory === value ? color : `${color}33`,
        paddingVertical: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: "center",
        transition: "0.3s",
      }}
    >
      <Text
        style={{
          color: selectedCategory === value ? "#fff" : "#014869",
          fontWeight: "bold",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );

  // === Render ===
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons={true} />

      {/* Barra superior */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          justifyContent: "space-between",
        }}
      >
        <Text>👤 {userName}</Text>

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

        <View style={{ flexDirection: "row" }}>
          <Pressable style={{ marginHorizontal: 8 }}>
            <Text>🔔</Text>
          </Pressable>
          <Pressable style={{ marginHorizontal: 8 }}>
            <Text>📅</Text>
          </Pressable>
          <Pressable style={{ marginHorizontal: 8 }}>
            <Text>≡</Text>
          </Pressable>
        </View>
      </View>

      {/* Contenido principal */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          paddingHorizontal: 16,
          gap: 16,
        }}
      >
        {/* Categorías */}
        <View style={{ width: "25%" }}>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Categorías
          </Text>

          <CategoryButton label="Todos" value="all" color="#014869" />
          <CategoryButton label="Deporte" value="deporte" color="#F3B23F" />
          <CategoryButton
            label="Concurso y taller"
            value="concurso"
            color="#F5D84A"
          />
          <CategoryButton
            label="Cultura e Historia"
            value="cultura"
            color="#784BA0"
          />
          <CategoryButton label="Arte y Música" value="arte" color="#3BAE9E" />
        </View>

        {/* Listado de eventos */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
            Listado de eventos
          </Text>

          <ScrollView>
            {filtered.length > 0 ? (
              filtered.map((ev) => {
                const isFav = favorites.includes(ev._id);
                return (
                  <View
                    key={ev._id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                      padding: 10,
                      backgroundColor: "#f9f9f9",
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: isFav ? "#014869" : "#ddd",
                      boxShadow: isFav
                        ? "0 0 6px rgba(1,72,105,0.3)"
                        : "0 0 2px rgba(0,0,0,0.1)",
                      transition: "0.2s",
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        flex: 1,
                        color: isFav ? "#014869" : "#333",
                        fontWeight: isFav ? "bold" : "500",
                      }}
                    >
                      {ev.title}
                    </Text>

                    <Pressable
                      onPress={() => toggleFavorite(ev._id)}
                      style={{
                        marginLeft: 10,
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: isFav ? "#014869" : "#E0E0E0",
                      }}
                    >
                      <Text
                        style={{
                          color: isFav ? "#fff" : "#555",
                          fontSize: 16,
                        }}
                      >
                        {isFav ? "★" : "☆"}
                      </Text>
                    </Pressable>
                  </View>
                );
              })
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 40,
                  color: "#777",
                  fontStyle: "italic",
                }}
              >
                {search.trim()
                  ? "🔍 No se encontraron eventos."
                  : "📭 No hay eventos disponibles."}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>

      {Platform.OS === "web" && <Footer />}
    </View>
  );
}
