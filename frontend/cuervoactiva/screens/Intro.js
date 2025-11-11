import React, { useEffect } from "react";
import { View, ScrollView, Platform, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/HeaderIntro";
import HeroBanner from "../components/HeroBanner";
import Footer from "../components/Footer";

export default function Intro() {
  const navigation = useNavigation();

  // Asegura fondo blanco también en web (body)
  useEffect(() => {
    if (Platform.OS === "web") {
      document.body.style.backgroundColor = "#ffffff";
    }
  }, []);

  // Guarda flag de que el usuario ya vio el intro
  const handleSeenIntro = async (nextScreen) => {
    try {
      await AsyncStorage.setItem("SEEN_INTRO", "true");
      navigation.navigate(nextScreen);
    } catch (err) {
      console.error("Error guardando SEEN_INTRO:", err);
      navigation.navigate(nextScreen);
    }
  };

  return (
    <View className="flex-1 bg-[#ffffff] justify-between">
      {/* HEADER */}
      {Platform.OS === "web" ? (
        <Header
          onLogin={() => handleSeenIntro("Login")}
          onRegister={() => handleSeenIntro("Register")}
        />
      ) : (
        <SafeAreaView className="mt-12">
          <Header
            onLogin={() => handleSeenIntro("Login")}
            onRegister={() => handleSeenIntro("Register")}
          />
        </SafeAreaView>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <View className="flex-1 bg-[#ffffff]">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
          }}
          className="bg-[#ffffff]"
        >
          <View className="items-center justify-center w-full bg-[#ffffff]">
            <HeroBanner onNext={() => handleSeenIntro("Login")} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
