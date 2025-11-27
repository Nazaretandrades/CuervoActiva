import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";

const API_URL = "http://10.0.2.2:5000/api/events";

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

  const [loading, setLoading] = useState(false);

  const getSessionToken = async () => {
    try {
      const sessionString = await AsyncStorage.getItem("USER_SESSION");
      const session = sessionString ? JSON.parse(sessionString) : null;
      return session?.token || null;
    } catch {
      return null;
    }
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
      formData.append("image", {
        uri,
        type: "image/jpeg",
        name: "imagen.jpg",
      });

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      setForm({ ...form, image_url: data.image_url });
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F8F8F8" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
