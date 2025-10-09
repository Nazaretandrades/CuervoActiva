import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Platform,
  Image,
  Alert,
  SafeAreaView,
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

  // 🔹 Helper para alertas multiplataforma
  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  async function onSubmit() {
    if (!emailOrUsername.trim()) {
      showAlert(
        "Campo obligatorio",
        "Por favor, introduce tu correo o nombre de usuario."
      );
      return;
    }
    if (!password.trim()) {
      showAlert("Campo obligatorio", "Por favor, introduce tu contraseña.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser({
        emailOrUsername,
        password,
      });

      // Éxito
      if (Platform.OS === "web") {
        window.alert("Inicio de sesión exitoso.");
      } else {
        Alert.alert("Éxito", "Inicio de sesión exitoso.");
      }

      // Aquí puedes guardar el token o redirigir al home
      console.log("Usuario autenticado:", data);
    } catch (e) {
      showAlert("Error en el inicio de sesión", e.message || "Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      {Platform.OS === "web" ? (
        <Header
          onLogin={() => navigation.navigate("Login")}
          onRegister={() => navigation.navigate("Register")}
        />
      ) : (
        <SafeAreaView style={{ marginTop: 50 }}>
          <Header
            onLogin={() => navigation.navigate("Login")}
            onRegister={() => navigation.navigate("Register")}
          />
        </SafeAreaView>
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff" }}>
        {/* Título */}
        <View style={{ alignItems: "center", marginTop: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Iniciar Sesión</Text>
        </View>

        {/* Formulario */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ width: "90%", maxWidth: 920 }}>
            {/* Email / Usuario */}
            <View style={{ marginBottom: 12 }}>
              <TextInput
                value={emailOrUsername}
                onChangeText={setEmailOrUsername}
                placeholder="Gmail o Usuario:"
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  padding: 8,
                  height: 42,
                  backgroundColor: "#fff",
                }}
              />
            </View>

            {/* Contraseña */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  height: 42,
                  backgroundColor: "#fff",
                }}
              >
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Contraseña:"
                  secureTextEntry={!showPass}
                  style={{
                    flex: 1,
                    padding: 8,
                    height: "100%",
                    backgroundColor: "#fff",
                  }}
                />
                <Pressable
                  onPress={() => setShowPass((s) => !s)}
                  style={{ paddingHorizontal: 8 }}
                >
                  <Image
                    source={require("../assets/iconos/invisible.png")}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: showPass ? "#f7931e" : "#666",
                    }}
                  />
                </Pressable>
              </View>
            </View>

            {/* Botón Iniciar Sesión */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Pressable
                onPress={onSubmit}
                disabled={loading}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  backgroundColor: "#fff",
                }}
              >
                <Text>{loading ? "Iniciando..." : "Iniciar Sesión"}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* FOOTER solo en web */}
        {Platform.OS === "web" && <Footer />}
      </ScrollView>
    </View>
  );
}
