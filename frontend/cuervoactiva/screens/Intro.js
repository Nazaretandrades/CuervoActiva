import React, { useEffect, useState } from "react";
import { View, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import HeroBanner from "../components/HeroBanner";

export default function Intro() {
  const navigation = useNavigation();
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === "web") document.body.style.margin = "0";
  }, []);

  const handleSeenIntro = async (screen) => {
    await AsyncStorage.setItem("SEEN_INTRO", "true");
    navigation.navigate(screen);
  };

  const windowHeight =
    typeof window !== "undefined" ? window.innerHeight : 800;

  const heroHeight = windowHeight - headerHeight;

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
