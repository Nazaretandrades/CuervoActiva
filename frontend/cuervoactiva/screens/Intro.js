import React from "react";
import { View, ScrollView, Platform, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Header from "../components/HeaderIntro";
import HeroBanner from "../components/HeroBanner";
import Footer from "../components/Footer";

export default function Intro() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER */}
      {Platform.OS === "web" ? (
        // 💻 Web: igual que antes
        <Header
          onLogin={() => navigation.navigate("Login")}
          onRegister={() => navigation.navigate("Register")}
        />
      ) : (
        // 📱 Móvil: más abajo y dentro de SafeAreaView
        <SafeAreaView style={{ marginTop: 50 }}>
          <Header
            onLogin={() => navigation.navigate("Login")}
            onRegister={() => navigation.navigate("Register")}
          />
        </SafeAreaView>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
          backgroundColor: "#fff",
        }}
      >
        {/* HERO BANNER */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            backgroundColor: "#fff",
            marginBottom: Platform.OS === "web" ? 0 : 20,
          }}
        >
          <HeroBanner
            onNext={() => {
              navigation.navigate("Home");
            }}
          />
        </View>
      </ScrollView>

      {/* FOOTER */}
      {Platform.OS === "web" && <Footer />}
    </View>
  );
}
