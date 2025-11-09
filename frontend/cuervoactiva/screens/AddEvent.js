import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";

const API_URL =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000/api/events"
    : "http://localhost:5000/api/events";

export default function AddEvent() {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    hour: "",
    location: "",
    category: "deporte",
    image_url: "",
  });

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") {
        alert("⚠️ Se necesita acceso a tus fotos");
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
          alert("❌ No se encontró sesión activa");
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
      }
    } catch (err) {
      alert("❌ Error al subir la imagen");
    }
  };

  const handleSubmit = async () => {
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
    if (missing.length > 0) {
      alert("⚠️ Completa todos los campos antes de continuar");
      return;
    }

    setLoading(true);
    try {
      const token = await getSessionToken();
      if (!token) {
        alert("❌ Sesión no encontrada");
        return;
      }

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al crear evento");
      alert("🎉 Evento creado con éxito");
      navigation.goBack();
    } catch {
      alert("❌ No se pudo crear el evento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      {/* CABECERA */}
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

      {/* FORMULARIO */}
      <ScrollView
        style={{ paddingHorizontal: 25, marginTop: 150 }}
        contentContainerStyle={{ paddingBottom: 100 }}
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

        {/* FILA Fecha / Lugar */}
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

        {/* FILA Hora / Categoría */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ width: "48%" }}>
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

        {/* IMAGEN */}
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

        {/* BOTÓN */}
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
    </View>
  );
}
