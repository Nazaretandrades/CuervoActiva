//PANTALLA LOGIN

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

//Componentes reutilizables
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";

//Servicio que gestiona la autenticación (petición al backend)
import { loginUser } from "../services/auth";

//2) Componente principal Login
export default function Login() {
  const navigation = useNavigation(); //Hook de navegación entre pantallas

  //Estados del formulario
  const [emailOrUsername, setEmailOrUsername] = useState(""); //Gmail o nombre de usuario
  const [password, setPassword] = useState(""); //Contraseña
  const [showPass, setShowPass] = useState(false); //Mostrar/ocultar contraseña
  const [loading, setLoading] = useState(false); //Estado de carga al enviar formulario

  //Helper para mostrar alertas compatibles con web y móvil
  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`); //En navegador
    } else {
      Alert.alert(title, message); //En móvil
    }
  };

  //Función de envío del formulario (login)
  async function onSubmit() {
    //Validación: campo usuario/email vacío
    if (!emailOrUsername.trim()) {
      showAlert(
        "Campo obligatorio",
        "Por favor, introduce tu correo o nombre de usuario."
      );
      return;
    }

    //Validación: campo contraseña vacío
    if (!password.trim()) {
      showAlert("Campo obligatorio", "Por favor, introduce tu contraseña.");
      return;
    }

    try {
      setLoading(true); //Activamos el estado de carga

      //Petición al backend para autenticar usuario
      const data = await loginUser({
        emailOrUsername,
        password,
      });

      //Si el login es exitoso:
      if (Platform.OS === "web") {
        window.alert("Inicio de sesión exitoso.");
      } else {
        Alert.alert("Éxito", "Inicio de sesión exitoso.");
      }

      //Aquí se podrá guardar el token en AsyncStorage o navegar al home
      console.log("✅ Usuario autenticado:", data);
    } catch (e) {
      //Manejo de errores
      showAlert(
        "Error en el inicio de sesión",
        e.message || "Intenta de nuevo."
      );
    } finally {
      setLoading(false); //Desactivamos el estado de carga
    }
  }

  //Renderizado de la pantalla
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      {Platform.OS === "web" ? (
        //En web: el header se muestra pegado arriba
        <Header
          onLogin={() => navigation.navigate("Login")}
          onRegister={() => navigation.navigate("Register")}
        />
      ) : (
        //En móvil: se añade espacio superior (SafeAreaView)
        <SafeAreaView style={{ marginTop: 50 }}>
          <Header
            onLogin={() => navigation.navigate("Login")}
            onRegister={() => navigation.navigate("Register")}
          />
        </SafeAreaView>
      )}

      {/*CONTENIDO PRINCIPAL */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "#fff" }}
      >
        {/*Título */}
        <View style={{ alignItems: "center", marginTop: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>
            Iniciar Sesión
          </Text>
        </View>

        {/*Formulario */}
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={{ width: "90%", maxWidth: 920 }}>
            {/*Campo: Email o Usuario */}
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

            {/*Campo: Contraseña */}
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
                  secureTextEntry={!showPass} //Alterna entre mostrar/ocultar contraseña
                  style={{
                    flex: 1,
                    padding: 8,
                    height: "100%",
                    backgroundColor: "#fff",
                  }}
                />

                {/*Icono de "mostrar/ocultar" contraseña */}
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

            {/*Botón de Iniciar Sesión */}
            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <Pressable
                onPress={onSubmit} //Llama a la función de login
                disabled={loading} //Desactiva el botón durante la carga
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

        {/*FOOTER (solo visible en web) */}
        {Platform.OS === "web" && <Footer />}
      </ScrollView>
    </View>
  );
}
