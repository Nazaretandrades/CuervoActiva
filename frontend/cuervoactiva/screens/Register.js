// Pantalla Registro
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
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderIntro";
import { registerUser } from "../services/auth";

// Se declara el componente
export default function Register() {
  // Estados
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, type: "", message: "" });
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Breakpoints
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 992;
  const isLaptop = width >= 992 && width < 1400;
  const isSmallMobile = width <= 360;
  const formWidth = isMobile
    ? "90%"
    : isTablet
    ? "70%"
    : isLaptop
    ? "40%"
    : "30%";

  // Mostrar toast
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

  // Función onSubmit
  async function onSubmit() {
    // Se comprueba cada campo
    if (!email.trim()) return showToast("error", "El email es obligatorio.");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return showToast("error", "Introduce un email válido.");

    if (!name.trim()) return showToast("error", "El nombre es obligatorio.");

    if (name.trim().length < 3)
      return showToast("error", "El nombre debe tener al menos 3 caracteres.");

    if (!password.trim())
      return showToast("error", "La contraseña es obligatoria.");

    if (password.length < 6)
      return showToast(
        "error",
        "La contraseña debe tener mínimo 6 caracteres."
      );

    try {
      setLoading(true);

      // Se hace el registro y lo redirige al Login
      await registerUser({ name, email, password, role });

      showToast("success", "Registro completado.");
      setTimeout(() => navigation.navigate("Login"), 1500);
    } catch (e) {
      showToast("error", e.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }
  const fieldHeight = isSmallMobile ? 44 : 48;
  const fieldPaddingH = isSmallMobile ? 10 : 14;
  const iconSize = isSmallMobile ? 18 : 20;
  const pickerHeight = isSmallMobile ? 50 : 55;

  // Return
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
      {/* Fondo */}
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

      {/* Header */}
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

      {/* Contenido */}
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
            fontSize: isMobile ? 26 : 34,
            fontWeight: "bold",
            color: "#014869",
            marginBottom: 25,
            textAlign: "center",
          }}
        >
          Crear cuenta
        </Text>

        {/* Card */}
        <View
          style={{
            width: formWidth,
            maxWidth: 480,
            backgroundColor: "#F9F9F9",
            borderRadius: 18,
            paddingVertical: isMobile ? 22 : 35,
            paddingHorizontal: isSmallMobile ? 16 : isMobile ? 20 : 30,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          {/* Email */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingHorizontal: fieldPaddingH,
              height: fieldHeight,
              marginBottom: 18,
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
              value={email}
              onChangeText={setEmail}
              placeholder="Correo electrónico"
              placeholderTextColor="#7a7a7a"
              maxLength={50}
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

          {/* Nombre de usuario */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingHorizontal: fieldPaddingH,
              height: fieldHeight,
              marginBottom: 18,
            }}
          >
            <Image
              source={require("../assets/iconos/usuario.png")}
              style={{
                width: iconSize,
                height: iconSize,
                marginRight: 8,
                tintColor: "#014869",
              }}
            />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nombre de usuario"
              placeholderTextColor="#7a7a7a"
              maxLength={30}
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

          {/* Rol */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#ddd",
              paddingHorizontal: fieldPaddingH,
              height: pickerHeight,
              marginBottom: 18,
            }}
          >
            <Image
              source={require("../assets/iconos/rol.png")}
              style={{
                width: iconSize,
                height: iconSize,
                marginRight: 8,
                tintColor: "#014869",
              }}
            />
            <Picker
              selectedValue={role}
              onValueChange={setRole}
              dropdownIconColor="#014869"
              style={{
                flex: 1,
                minWidth: 0,
                color: "#014869",
                backgroundColor: "transparent",
                fontSize: isSmallMobile ? 14 : 15,
              }}
            >
              <Picker.Item label="Usuario" value="user" />
              <Picker.Item label="Organizador" value="organizer" />
            </Picker>
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
              paddingHorizontal: fieldPaddingH,
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
              maxLength={40}
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

          {/* Subir - Botón */}
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
              {loading ? "Registrando..." : "Registrarse"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Toast */}
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
