//PANTALLA REGISTRO
//1) Importaciones necesarias
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
import { Picker } from "@react-native-picker/picker"; //Desplegable de roles
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { registerUser } from "../services/auth"; //Función que envía los datos al backend

//2) Componente principal Register
export default function Register() {
  const navigation = useNavigation(); //Hook para navegar entre pantallas

  //Estados del formulario
  const [email, setEmail] = useState(""); //Correo electrónico
  const [name, setName] = useState(""); //Nombre de usuario
  const [role, setRole] = useState("user"); //Rol del usuario (user u organizer)
  const [password, setPassword] = useState(""); //Contraseña
  const [showPass, setShowPass] = useState(false); //Mostrar/ocultar contraseña
  const [loading, setLoading] = useState(false); //Controla el estado de carga del botón

  //Función para enviar el formulario de registro
  async function onSubmit() {
    //Helper para mostrar alertas compatibles con web y móvil
    const showAlert = (title, message) => {
      if (Platform.OS === "web") {
        window.alert(`${title}\n\n${message}`); //En navegador
      } else {
        Alert.alert(title, message); //En móvil
      }
    };

    //Validación: todos los campos son obligatorios
    if (!email.trim()) {
      showAlert(
        "Campo obligatorio",
        "Por favor, introduce tu correo electrónico."
      );
      return;
    }
    if (!name.trim()) {
      showAlert(
        "Campo obligatorio",
        "Por favor, introduce tu nombre de usuario."
      );
      return;
    }
    if (!password.trim()) {
      showAlert("Campo obligatorio", "Por favor, introduce una contraseña.");
      return;
    }

    try {
      setLoading(true); //Muestra “Registrando…” mientras se envía
      await registerUser({ name, email, password, role }); //Llama al backend

      //Mensaje de éxito + redirección automática al login
      if (Platform.OS === "web") {
        window.alert("✅ Registro completado correctamente.");
        navigation.navigate("Login"); //Redirige al login en web
      } else {
        Alert.alert("Éxito", "Tu registro se ha completado correctamente.", [
          {
            text: "Ir a iniciar sesión",
            onPress: () => navigation.navigate("Login"), //Redirige al login en móvil
          },
        ]);
      }
    } catch (e) {
      //Muestra error si el registro falla (por ejemplo, correo ya usado)
      showAlert("Error en el registro", e.message || "Intenta de nuevo.");
    } finally {
      setLoading(false); //Restaura el botón
    }
  }

  //Renderizado de la pantalla
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/*HEADER — con margen superior en móvil */}
      {Platform.OS === "web" ? (
        // En web: el header se muestra normalmente
        <Header
          onLogin={() => navigation.navigate("Login")}
          onRegister={() => navigation.navigate("Register")}
        />
      ) : (
        // En móvil: se baja el header con SafeAreaView
        <SafeAreaView style={{ marginTop: 50 }}>
          <Header
            onLogin={() => navigation.navigate("Login")}
            onRegister={() => navigation.navigate("Register")}
          />
        </SafeAreaView>
      )}

      {/*CONTENIDO PRINCIPAL — Scroll general */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff" }}
      >
        {/* 🔸 Título */}
        <View style={{ alignItems: "center", marginTop: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Registrarse</Text>
        </View>

        {/* Contenedor del formulario */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ width: "90%", maxWidth: 920 }}>
            {/* Fila 1: Gmail | Usuario */}
            <View
              style={{
                flexDirection: Platform.OS === "web" ? "row" : "column",
                gap: 12,
                marginBottom: 12,
              }}
            >
              {/* Campo de Gmail */}
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

              {/* Campo de Usuario */}
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
              {/* Desplegable de rol */}
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    borderWidth: 1,
                    height: Platform.OS === "android" ? 55 : 42, //Ajuste de altura según SO
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

              {/* Campo de Contraseña */}
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
                    secureTextEntry={!showPass} //Oculta el texto si showPass es false
                    style={{
                      flex: 1,
                      padding: 8,
                      height: "100%",
                      backgroundColor: "#fff",
                    }}
                  />
                  {/* Icono de mostrar/ocultar contraseña */}
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

            {/* Botón de Registro */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Pressable
                onPress={onSubmit} //Ejecuta el registro
                disabled={loading} //Desactiva durante carga
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

        {/*(solo visible en web) */}
        {Platform.OS === "web" && <Footer />}
      </ScrollView>
    </View>
  );
}
