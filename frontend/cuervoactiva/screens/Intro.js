// Pantalla de Introducción
import React, { useEffect, useState } from "react";
import { View, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import HeroBanner from "../components/HeroBanner";

// Se declara el componente
export default function Intro() {
  const navigation = useNavigation();
  // guarda la altura exacta del Header
  const [headerHeight, setHeaderHeight] = useState(0);

  // Función que se redimensiona en tiempo real lo de los bordes blancos
  useEffect(() => {
    if (Platform.OS === "web") document.body.style.margin = "0";
  }, []);

  // Guarda en AsyncStorage que el usuario ya vio la intro y navega hacia Login o REgister
  const handleSeenIntro = async (screen) => {
    await AsyncStorage.setItem("SEEN_INTRO", "true");
    navigation.navigate(screen);
  };

  // Breakpoints
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const heroHeight = windowHeight - headerHeight;

  // UI
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/**Header */}
      <Header
        onLogin={() => handleSeenIntro("Login")}
        onRegister={() => handleSeenIntro("Register")}
        onHeaderHeight={(h) => setHeaderHeight(h)}
      />
      {/* HERO con altura exacta */}
      <View style={{ height: heroHeight, width: "100%" }}>
        <HeroBanner height={heroHeight} />
      </View>
    </View>
  );
}
