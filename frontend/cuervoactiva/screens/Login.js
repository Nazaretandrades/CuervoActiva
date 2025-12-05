import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Platform,
  StatusBar,
  Animated,
  useWindowDimensions,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderIntro";
import { loginUser } from "../services/auth";
import { saveSession } from "../services/sessionManager";

export default function Login() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "", message: "" });
  const fadeAnim = useState(new Animated.Value(0))[0];

  // BREAKPOINTS
  const isMobile = width < 600;
  const isSmallMobile = width <= 360;
  const isTablet = width >= 600 && width < 992;
  const isLaptop = width >= 992 && width < 1400;

  const formWidth = isMobile
    ? "90%"
    : isTablet
    ? "70%"
    : isLaptop
    ? "40%"
    : "30%";

  const fieldHeight = isSmallMobile ? 44 : 48;
  const paddingH = isSmallMobile ? 10 : 14;
  const iconSize = isSmallMobile ? 18 : 20;

  const showToast = (type, msg) => {
    setToast({ visible: true, type, message: msg });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setToast({ visible: false }));
    }, 2000);
  };

  async function onSubmit() {
    if (!emailOrUsername.trim() || !password.trim()) {
      showToast("error", "Completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      const data = await loginUser({ emailOrUsername, password });
      await saveSession(data);

      const role = data.user?.role || data.role;

      // ADMIN
      if (role === "admin") {
        if (Platform.OS === "web") {
          showToast("success", "Inicio exitoso");
          navigation.reset({ index: 0, routes: [{ name: "Admin" }] });
        } else {
          showToast("error", "Solo disponible en Web");
        }
        return; 
      }

      // ORGANIZER
      if (role === "organizer") {
        showToast("success", "Inicio exitoso");
        navigation.reset({ index: 0, routes: [{ name: "Organizer" }] });
        return;
      }

      // USER NORMAL
      showToast("success", "Inicio exitoso");
      navigation.reset({ index: 0, routes: [{ name: "User" }] });
    } catch (e) {
      showToast("error", e.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "#fff",
        overflow: "hidden",
      }}
    >
      {/* BACKGROUND */}
      <Image
        source={require("../assets/fondo.png")}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          resizeMode: "cover",
          opacity: 1,
        }}
      />

      {/* HEADER */}
      {Platform.OS === "web" ? (
        <Header
          onLogin={() => navigation.navigate("Login")}
          onRegister={() => navigation.navigate("Register")}
        />
      ) : (
        <View>
          <Header
            onLogin={() => navigation.navigate("Login")}
            onRegister={() => navigation.navigate("Register")}
          />
        </View>
      )}

      {/* CONTENT */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: isSmallMobile ? 12 : 20,
        }}
      >
        <Text
          style={{
            fontSize: isMobile ? 28 : 34,
            fontWeight: "bold",
            color: "#014869",
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          Iniciar Sesión
        </Text>

        {/* CARD */}
        <View
          style={{
            width: formWidth,
            maxWidth: 480,
            backgroundColor: "#F9F9F9",
            borderRadius: 18,
            paddingVertical: isMobile ? 25 : 35,
            paddingHorizontal: isSmallMobile ? 16 : isMobile ? 20 : 30,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          {/* EMAIL */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingHorizontal: paddingH,
              height: fieldHeight,
              marginBottom: 20,
            }}
          >
            <Image
              source={require("../assets/iconos/email.png")}
              style={{
                width: iconSize,
                height: iconSize,
                marginRight: 8,
                tintColor: "#014869",
              }}
            />
            <TextInput
              value={emailOrUsername}
              onChangeText={setEmailOrUsername}
              placeholder="Correo o Usuario"
              placeholderTextColor="#7a7a7a"
              numberOfLines={1}
              ellipsizeMode="clip"
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: isSmallMobile ? 14 : 15,
                color: "#014869",
                padding: 0,
              }}
            />
          </View>

          {/* PASSWORD */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingHorizontal: paddingH,
              height: fieldHeight,
              marginBottom: 28,
            }}
          >
            <Image
              source={require("../assets/iconos/lock.png")}
              style={{
                width: iconSize,
                height: iconSize,
                marginRight: 8,
                tintColor: "#014869",
              }}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              placeholderTextColor="#7a7a7a"
              secureTextEntry={!showPass}
              numberOfLines={1}
              ellipsizeMode="clip"
              style={{
                flex: 1,
                minWidth: 0,
                fontSize: isSmallMobile ? 14 : 15,
                color: "#014869",
                padding: 0,
              }}
            />
            <Pressable onPress={() => setShowPass(!showPass)}>
              <Image
                source={require("../assets/iconos/invisible.png")}
                style={{
                  width: isSmallMobile ? 16 : 18,
                  height: isSmallMobile ? 16 : 18,
                  tintColor: showPass ? "#F3B23F" : "#014869",
                }}
              />
            </Pressable>
          </View>

          {/* SUBMIT */}
          <Pressable
            onPress={onSubmit}
            disabled={loading}
            style={{
              backgroundColor: "#F3B23F",
              borderRadius: 8,
              paddingVertical: isSmallMobile ? 10 : 12,
              alignItems: "center",
              opacity: loading ? 0.7 : 1,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: isSmallMobile ? 15 : 16,
              }}
            >
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* TOAST */}
      {toast.visible && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: 40,
            left: "8%",
            right: "8%",
            backgroundColor: toast.type === "success" ? "#4CAF50" : "#E74C3C",
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 12,
            opacity: fadeAnim,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontSize: 15 }}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}
