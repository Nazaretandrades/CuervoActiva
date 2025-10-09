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
import { Picker } from "@react-native-picker/picker";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { registerUser } from "../services/auth";

export default function Register() {
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    const showAlert = (title, message) => {
      if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`);
      } else {
        Alert.alert(title, message);
      }
    };

    // ✅ Validación de campos vacíos
    if (!email.trim()) {
      showAlert("Campo obligatorio", "Por favor, introduce tu correo electrónico.");
      return;
    }
    if (!name.trim()) {
      showAlert("Campo obligatorio", "Por favor, introduce tu nombre de usuario.");
      return;
    }
    if (!password.trim()) {
      showAlert("Campo obligatorio", "Por favor, introduce una contraseña.");
      return;
    }

    try {
      setLoading(true);
      await registerUser({ name, email, password, role });

      // ✅ Mensaje de éxito + redirección automática al login
      if (Platform.OS === "web") {
        window.alert("✅ Registro completado correctamente.");
        navigation.navigate("Login");
      } else {
        Alert.alert("Éxito", "Tu registro se ha completado correctamente.", [
          {
            text: "Ir a iniciar sesión",
            onPress: () => navigation.navigate("Login"),
          },
        ]);
      }
    } catch (e) {
      showAlert("Error en el registro", e.message || "Intenta de nuevo.");
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
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Registrarse</Text>
        </View>

        {/* Contenedor principal */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ width: "90%", maxWidth: 920 }}>
            {/* Fila 1: Email | Usuario */}
            <View
              style={{
                flexDirection: Platform.OS === "web" ? "row" : "column",
                gap: 12,
                marginBottom: 12,
              }}
            >
              {/* Gmail */}
              <View style={{ flex: 1 }}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Gmail:"
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

              {/* Usuario */}
              <View style={{ flex: 1 }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Usuario:"
                  autoCapitalize="none"
                  style={{
                    borderWidth: 1,
                    padding: 8,
                    height: 42,
                    backgroundColor: "#fff",
                  }}
                />
              </View>
            </View>

            {/* Fila 2: Rol | Contraseña */}
            <View
              style={{
                flexDirection: Platform.OS === "web" ? "row" : "column",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {/* Rol */}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    borderWidth: 1,
                    height: Platform.OS === "android" ? 55 : 42,
                    justifyContent: "center",
                    backgroundColor: "#fff",
                    overflow: "hidden",
                    borderRadius: 4,
                  }}
                >
                  <Picker
                    selectedValue={role}
                    onValueChange={setRole}
                    dropdownIconColor="#333"
                    style={{
                      height: "100%",
                      color: "#000",
                      fontSize: 13,
                      paddingVertical: 4,
                      marginTop: Platform.OS === "android" ? -2 : 0,
                    }}
                    itemStyle={{
                      fontSize: 16,
                    }}
                  >
                    <Picker.Item label="Usuario" value="user" />
                    <Picker.Item label="Organizador" value="organizer" />
                  </Picker>
                </View>
              </View>

              {/* Contraseña */}
              <View style={{ flex: 1 }}>
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
            </View>

            {/* Botón Registrar */}
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
                <Text>{loading ? "Registrando..." : "Registrarse"}</Text>
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
