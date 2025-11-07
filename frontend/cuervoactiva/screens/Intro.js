import React, { useEffect } from "react";
import { View, ScrollView, Platform, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderIntro";
import HeroBanner from "../components/HeroBanner";
import Footer from "../components/Footer";

export default function Intro() {
  const navigation = useNavigation();

  // ✅ Asegura fondo blanco también en web (body)
  useEffect(() => {
    if (Platform.OS === "web") {
      document.body.style.backgroundColor = "#ffffff";
    }
  }, []);

  return (
    <View className="flex-1 bg-[#ffffff] justify-between">
      {/* HEADER */}
      {Platform.OS === "web" ? (
        <Header
          onLogin={() => navigation.navigate("Login")}
          onRegister={() => navigation.navigate("Register")}
        />
      ) : (
        <SafeAreaView className="mt-12">
          <Header
            onLogin={() => navigation.navigate("Login")}
            onRegister={() => navigation.navigate("Register")}
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
            <HeroBanner onNext={() => navigation.navigate("Home")} />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
