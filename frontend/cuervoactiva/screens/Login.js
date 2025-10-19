import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
  Platform,
  Dimensions,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { loginUser } from "../services/auth";

export default function Login() {
  const navigation = useNavigation();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { height, width } = Dimensions.get("window");
  const isMobile = width < 768;

  const showAlert = (title, message) => {
    if (Platform.OS === "web") window.alert(`${title}\n\n${message}`);
    else Alert.alert(title, message);
  };

  async function onSubmit() {
    if (!emailOrUsername.trim() || !password.trim()) {
      showAlert("Campos obligatorios", "Por favor, completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      await loginUser({ emailOrUsername, password });
      showAlert("✅ Éxito", "Inicio de sesión exitoso.");
    } catch (e) {
      showAlert("Error", e.message || "Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* 🔹 Fondo decorativo */}
      <Image
        source={require("../assets/fondo.png")}
        style={{
          position: "absolute",
          right: isMobile ? "-50%" : "-30%",
          top: isMobile ? "-80%" : "15%",
          transform: [
            { translateY: isMobile ? -200 : -250 },
            { scale: isMobile ? 0.8 : 1 },
          ],
          width: isMobile ? "300%" : "120%",
          height: isMobile ? "300%" : "120%",
          resizeMode: "contain",
          opacity: 0.9,
          zIndex: 0,
        }}
      />

      {/* 🔹 HEADER */}
      {Platform.OS === "web" ? (
        <Header
          onLogin={() => navigation.navigate("Login")}
          onRegister={() => navigation.navigate("Register")}
        />
      ) : (
        <View style={{ marginTop: StatusBar.currentHeight ? 0 : 0 }}>
          <Header
            onLogin={() => navigation.navigate("Login")}
            onRegister={() => navigation.navigate("Register")}
          />
        </View>
      )}

      {/* 🔹 CONTENIDO */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: isMobile ? 30 : 50,
        }}
      >
        {/* 🔸 Título */}
        <Text
          style={{
            fontSize: isMobile ? 24 : 30,
            fontWeight: "bold",
            color: "#014869",
            marginBottom: isMobile ? 20 : 30,
            textAlign: "center",
          }}
        >
          Iniciar Sesión
        </Text>

        {/* 🔸 FORMULARIO */}
        <View
          style={{
            width: isMobile ? "90%" : "80%",
            maxWidth: 760,
            backgroundColor: "#F4F4F4",
            borderRadius: 20,
            paddingVertical: isMobile ? 30 : 40,
            paddingHorizontal: isMobile ? 25 : 50,
            zIndex: 1,
          }}
        >
          {/* Email o Usuario */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 50,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingHorizontal: 14,
              height: 50,
              marginBottom: 20,
            }}
          >
            <Image
              source={require("../assets/iconos/usuario.png")}
              style={{
                width: 20,
                height: 20,
                marginRight: 10,
                tintColor: "#014869",
              }}
            />
            <TextInput
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              placeholder="Gmail o Usuario:"
              placeholderTextColor="#7a7a7a"
              style={{
                flex: 1,
                color: "#014869",
                fontSize: 15,
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Contraseña */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 50,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingHorizontal: 14,
              height: 50,
              marginBottom: 25,
            }}
          >
            <Image
              source={require("../assets/iconos/lock.png")}
              style={{
                width: 20,
                height: 20,
                marginRight: 10,
                tintColor: "#014869",
              }}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña:"
              placeholderTextColor="#7a7a7a"
              secureTextEntry={!showPass}
              style={{
                flex: 1,
                color: "#014869",
                fontSize: 15,
              }}
            />
            <Pressable onPress={() => setShowPass(!showPass)}>
              <Image
                source={require("../assets/iconos/invisible.png")}
                style={{
                  width: 20,
                  height: 20,
                  tintColor: showPass ? "#F3B23F" : "#014869",
                }}
              />
            </Pressable>
          </View>

          {/* Botón */}
          <View style={{ alignItems: "center", marginTop: 10 }}>
            <Pressable
              onPress={onSubmit}
              disabled={loading}
              android_ripple={{ color: "rgba(255,255,255,0.2)" }}
              style={{
                backgroundColor: "#F3B23F",
                borderRadius: 25,
                paddingVertical: 10,
                paddingHorizontal: 28,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                {loading ? "Iniciando..." : "Iniciar Sesión"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER solo en web */}
      {Platform.OS === "web" && <Footer />}
    </View>
  );
}
