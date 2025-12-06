// Pantalla para crear evento en móvil nativo
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  KeyboardAvoidingView, // Evita que el teclado tape los inputs
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Permite seleccionar imágenes desde la galería del móvil
import AsyncStorage from "@react-native-async-storage/async-storage"; // Guarda y recupera la sesión del usuario en móvil
import { Picker } from "@react-native-picker/picker"; // Selector de categorías
import { useNavigation } from "@react-navigation/native"; // Permite navegar entre pantallas
import Constants from "expo-constants"; // Permite importar constantes
// URL base según entorno local o producción
const LOCAL_API =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const BACKEND_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  LOCAL_API;

const API_URL = `${BACKEND_URL}/api/events`;

// Se declara el componente (Pantalla donde un organizador crea un evento)
export default function AddEvent() {
  //Permite usar navigation.goBack() o navegar a otras pantallas
  const navigation = useNavigation();

  // Estado del formulario
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    hour: "",
    location: "",
    category: "deporte",
    image_url: "",
  });

  // Controla si el botón debe mostrar "Guardando..."
  const [loading, setLoading] = useState(false);

  // Función para obtener el token
  const getSessionToken = async () => {
    try {
      // Lee la sesión guardada 
      const sessionString = await AsyncStorage.getItem("USER_SESSION");
      // Extrae el token JWT
      const session = sessionString ? JSON.parse(sessionString) : null;
      // Lo retorna para autorizar peticiones protegidas
      return session?.token || null;
    } catch {
      return null;
    }
  };

  // Función para seleccionar imágenes
  const pickImage = async () => {
    // 1. Pedir permisos
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      alert("⚠️ Se necesita acceso a tus fotos");
      return;
    }

    // 2. Abre la galería
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    // 3. Si el usuario eligió imagen
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      // 4. Obtener token
      const token = await getSessionToken();
      if (!token) {
        alert("❌ No se encontró sesión activa");
        return;
      }

      // 5. Subir imagen al backend
      const formData = new FormData();
      formData.append("image", {
        uri,
        type: "image/jpeg",
        name: "imagen.jpg",
      });

      // 6. Petición fetch
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      // 7. Guardar URL recibida
      const data = await res.json();
      setForm({ ...form, image_url: data.image_url });
    }
  };

  // Función de enviar
  const handleSubmit = async () => {
    // Se valida los campos
    if (!form.title.trim()) {
      alert("⚠️ El título es obligatorio");
      return;
    }
    if (!form.description.trim()) {
      alert("⚠️ La descripción es obligatoria");
      return;
    }

    if (!form.date.trim()) {
      alert("⚠️ La fecha es obligatoria");
      return;
    }

    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.date)) {
      alert("⚠️ La fecha debe tener formato DD/MM/YYYY");
      return;
    }

    if (!form.hour.trim()) {
      alert("⚠️ La hora es obligatoria");
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(form.hour)) {
      alert("⚠️ La hora debe tener formato HH:MM");
      return;
    }

    if (!form.location.trim()) {
      alert("⚠️ La ubicación es obligatoria");
      return;
    }

    if (!form.category.trim()) {
      alert("⚠️ La categoría es obligatoria");
      return;
    }

    if (!form.image_url.trim()) {
      alert("⚠️ Debes añadir una imagen");
      return;
    }

    // Enviar al backend
    setLoading(true);

    // Obtener token
    try {
      const token = await getSessionToken();
      if (!token) {
        alert("❌ Sesión no encontrada");
        return;
      }

      // Petición POST al backend
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      // Respuesta
      if (!res.ok) {
        throw new Error("Error al crear evento");
      }

      alert("🎉 Evento creado con éxito");
      navigation.goBack();
    } catch (err) {
      alert("❌ No se pudo crear el evento");
    } finally {
      // Reset loading
      setLoading(false);
    }
  };

  // UI
  return (
    <KeyboardAvoidingView // vista especial que mueve o ajusta la pantalla cuando aparece el teclado
      style={{ flex: 1, backgroundColor: "#F8F8F8" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/**Encabezado */}
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
          Añadir evento
        </Text>
      </View>

      {/**Formulario en ScrollView */}
      <ScrollView
        style={{ paddingHorizontal: 25, marginTop: 20 }}
        contentContainerStyle={{ paddingBottom: 150 }}
        showsVerticalScrollIndicator={false}
      >
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

        <Text style={{ fontWeight: "600", marginBottom: 6, color: "#014869" }}>
          Categoría:
        </Text>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#ddd",
            marginBottom: 12,
            justifyContent: "center",
            height: 60,
          }}
        >
          {/**Selector de categorías */}
          <Picker
            selectedValue={form.category}
            onValueChange={(value) => setForm({ ...form, category: value })}
            dropdownIconColor="#014869"
            style={{
              height: 60,
              color: "#014869",
              fontSize: 16,
              justifyContent: "center",
            }}
            itemStyle={{
              fontSize: 16,
              color: "#014869",
            }}
          >
            <Picker.Item label="Deporte" value="deporte" />
            <Picker.Item label="Concurso y Taller" value="concurso" />
            <Picker.Item label="Cultura e Historia" value="cultura" />
            <Picker.Item label="Arte y Música" value="arte" />
          </Picker>
        </View>

        <Text style={{ fontWeight: "600", marginBottom: 6, color: "#014869" }}>
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

        <View
          style={{
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 10,
            backgroundColor: "#fff",
            height: 150,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          {/**Subida de imagen */}
          {form.image_url ? (
            <Image
              source={{ uri: form.image_url }}
              style={{ width: 120, height: 120, borderRadius: 8 }}
            />
          ) : (
            <Pressable onPress={pickImage}>
              <View style={{ alignItems: "center" }}>
                <Image
                  source={require("../assets/iconos/add-image.png")}
                  style={{
                    width: 28,
                    height: 28,
                    tintColor: "#014869",
                    marginBottom: 6,
                  }}
                />
                <Text style={{ color: "#014869" }}>Añadir imagen</Text>
              </View>
            </Pressable>
          )}
        </View>

        {/**Botón para crear el evento */}
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
              {loading ? "Guardando..." : "Crear evento"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
