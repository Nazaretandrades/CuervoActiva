import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Platform,
  Dimensions,
  StatusBar,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderIntro";
import { loginUser } from "../services/auth";
import { saveSession } from "../services/sessionManager";

export default function Login() {
  const navigation = useNavigation();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ visible: false, type: "", message: "" });
  const fadeAnim = useState(new Animated.Value(0))[0];

  const { width } = Dimensions.get("window");
  const isMobile = width < 768;

  /** Mostrar mensajes visuales */
  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast({ visible: false, type: "", message: "" }));
    }, 3000);
  };

  /** LOGIN */
  async function onSubmit() {
    if (!emailOrUsername.trim() || !password.trim()) {
      showToast("error", "Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser({ emailOrUsername, password });
      const role = data.user?.role || data.role;

      if (!role) {
        showToast("error", "No se pudo identificar el rol del usuario.");
        return;
      }

      await saveSession(data);

      if (role === "organizer") {
        showToast("success", "Inicio de sesión exitoso como Organizador.");
        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: "Organizer" }] });
        }, 1200);
      } else if (role === "admin") {
        if (Platform.OS === "web") {
          showToast("success", "Inicio de sesión exitoso como Administrador.");
          setTimeout(() => {
            navigation.reset({ index: 0, routes: [{ name: "Admin" }] });
          }, 1200);
        } else {
          showToast(
            "error",
            "El panel de administrador solo está disponible en la versión web."
          );
        }
      } else if (role === "user") {
        showToast("success", "Inicio de sesión exitoso como Usuario.");
        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: "User" }] });
        }, 1200);
      } else {
        showToast("success", "Inicio de sesión exitoso.");
        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: "Intro" }] });
        }, 1200);
      }
    } catch (e) {
      showToast("error", e.message || "❌ Error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
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

      {/* HEADER */}
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

      {/* CONTENIDO */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: isMobile ? 10 : 50,
        }}
      >
        {/* Título */}
        <Text
          style={{
            fontSize: isMobile ? 24 : 28,
            fontWeight: "bold",
            color: "#014869",
            marginBottom: 25,
            textAlign: "center",
          }}
        >
          Iniciar Sesión
        </Text>

        {/* FORMULARIO */}
        <View
          style={{
            width: isMobile ? "85%" : "60%",
            maxWidth: 400,
            backgroundColor: "#F9F9F9",
            borderRadius: 15,
            paddingVertical: 30,
            paddingHorizontal: 25,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
            alignItems: "center",
          }}
        >
          {/* Email o Usuario */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingHorizontal: 12,
              height: 42,
              width: "100%",
              marginBottom: 15,
            }}
          >
            <Image
              source={require("../assets/iconos/email.png")}
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
                fontSize: 14,
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
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingHorizontal: 12,
              height: 42,
              width: "100%",
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
                fontSize: 14,
              }}
            />
            <Pressable onPress={() => setShowPass(!showPass)}>
              <Image
                source={require("../assets/iconos/invisible.png")}
                style={{
                  width: 18,
                  height: 18,
                  tintColor: showPass ? "#F3B23F" : "#014869",
                }}
              />
            </Pressable>
          </View>

          {/* Botón */}
          <Pressable
            onPress={onSubmit}
            disabled={loading}
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            style={{
              backgroundColor: "#F3B23F",
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 40,
              alignItems: "center",
              justifyContent: "center",
              opacity: loading ? 0.7 : 1,
              shadowColor: "#000",
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 4,
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
      </ScrollView>

      {/* TOAST */}
      {toast.visible && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 60,
            left: "5%",
            right: "5%",
            backgroundColor: toast.type === "success" ? "#4CAF50" : "#E74C3C",
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 12,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 5,
            opacity: fadeAnim,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              textAlign: "center",
              fontSize: 15,
            }}
          >
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
