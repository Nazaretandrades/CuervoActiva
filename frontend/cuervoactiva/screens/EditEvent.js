// Pantalla para editar evento en móvil nativo
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "expo-constants";

const LOCAL_API =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const BASE_URL =
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
    Constants.manifest?.extra?.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    LOCAL_API);

const API_URL = `${BASE_URL}/api/events`;

// Se declara el componente
export default function EditEvent() {
  // Estados
  const navigation = useNavigation();
  const route = useRoute();
  const { eventData } = route.params || {};
  const [form, setForm] = useState(eventData || {});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Obtengo la sesión
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

  // Función para el botón de editar
  const handleSubmit = async () => {
    // Se comprueba los campos requeridos
    const required = [
      "title",
      "description",
      "date",
      "hour",
      "location",
      "category",
    ];
    const missing = required.filter((f) => !form[f]?.trim());
    if (missing.length > 0) {
      alert("⚠️ Completa todos los campos antes de continuar");
      return;
    }

    setLoading(true);
    try {
      // Obtengo la sesión y el token
      const token = await getSessionToken();
      if (!token) {
        alert("❌ Sesión no encontrada");
        return;
      }
      // Hago el fetch
      const res = await fetch(`${API_URL}/${form._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      // Obtengo la respuesta
      if (!res.ok) throw new Error("Error al actualizar evento");
      alert("✅ Evento actualizado con éxito");
      navigation.goBack();
    } catch {
      alert("❌ No se pudo actualizar el evento");
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 50,
          paddingBottom: 10,
          backgroundColor: "#F8F8F8",
        }}
      >
        {/**Botón para ir para detrás */}
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/iconos/back-organizador.png")}
            style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
          />
        </Pressable>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#F3B23F",
            marginLeft: 15,
          }}
        >
          Editar evento
        </Text>
      </View>

      <ScrollView
        style={{ paddingHorizontal: 25, marginTop: 150 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Título */}
        <Text style={{ fontWeight: "600", marginBottom: 6, color: "#014869" }}>
          Título del Evento:
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#ddd",
            marginBottom: 12,
            paddingHorizontal: 10,
          }}
        >
          <Image
            source={require("../assets/iconos/lapiz.png")}
            style={{
              width: 16,
              height: 16,
              tintColor: "#014869",
              marginRight: 8,
              transform: [{ rotate: "-20deg" }],
            }}
          />
          <TextInput
            value={form.title}
            onChangeText={(t) => setForm({ ...form, title: t })}
            style={{ flex: 1, height: 40 }}
          />
        </View>

        {/* Descripción */}
        <Text style={{ fontWeight: "600", marginBottom: 6, color: "#014869" }}>
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
            borderColor: "#ddd",
            height: 80,
            padding: 10,
            marginBottom: 12,
            textAlignVertical: "top",
          }}
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: "48%" }}>
            {/* Fecha */}
            <Text
              style={{ fontWeight: "600", marginBottom: 6, color: "#014869" }}
            >
              Fecha:
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#ddd",
                paddingHorizontal: 10,
                marginBottom: 12,
              }}
            >
              <Image
                source={require("../assets/iconos/calendar-organizador.png")}
                style={{
                  width: 16,
                  height: 16,
                  tintColor: "#014869",
                  marginRight: 8,
                }}
              />
              <TextInput
                value={form.date}
                onChangeText={(t) => setForm({ ...form, date: t })}
                placeholder="DD/MM/YYYY"
                style={{ flex: 1, height: 40 }}
              />
            </View>
          </View>

          <View style={{ width: "48%" }}>
            {/* Lugar */}
            <Text
              style={{ fontWeight: "600", marginBottom: 6, color: "#014869" }}
            >
              Lugar:
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#ddd",
                paddingHorizontal: 10,
                marginBottom: 12,
              }}
            >
              <Image
                source={require("../assets/iconos/ubicacion.png")}
                style={{
                  width: 16,
                  height: 16,
                  tintColor: "#014869",
                  marginRight: 8,
                }}
              />
              <TextInput
                value={form.location}
                onChangeText={(t) => setForm({ ...form, location: t })}
                style={{ flex: 1, height: 40 }}
              />
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: "48%" }}>
            {/* Hora */}
            <Text
              style={{ fontWeight: "600", marginBottom: 6, color: "#014869" }}
            >
              Hora:
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#ddd",
                paddingHorizontal: 10,
                marginBottom: 12,
              }}
            >
              <Image
                source={require("../assets/iconos/reloj.png")}
                style={{
                  width: 16,
                  height: 16,
                  tintColor: "#014869",
                  marginRight: 8,
                }}
              />
              <TextInput
                value={form.hour}
                onChangeText={(t) => setForm({ ...form, hour: t })}
                placeholder="HH:MM"
                style={{ flex: 1, height: 40 }}
              />
            </View>
          </View>

          <View style={{ width: "48%", zIndex: open ? 9999 : 1 }}>
            {/* Categoría */}
            <Text
              style={{ fontWeight: "600", marginBottom: 6, color: "#014869" }}
            >
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
                borderRadius: 10,
                height: 40,
              }}
              dropDownContainerStyle={{
                borderColor: "#ddd",
                elevation: 10,
              }}
            />
          </View>
        </View>

        {/* Botón de Guardar */}
        <View style={{ alignItems: "center", marginTop: 30 }}>
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
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
              {loading ? "Guardando..." : "Guardar cambios"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
