//PANTALLA DE BIENVENIDA

//1) Importamos los módulos necesarios
import React from "react";
import { View, ScrollView, Platform, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";

//Componentes reutilizables
import Header from "../components/HeaderIntro";
import HeroBanner from "../components/HeroBanner";
import Footer from "../components/Footer";

//2) Componente principal de la pantalla Intro
export default function Intro() {
  const navigation = useNavigation(); //Hook de navegación

  return (
    //Contenedor general de toda la pantalla
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* HEADER (parte superior) */}
      {Platform.OS === "web" ? (
        // En web: el header se muestra normal (pegado arriba)
        <Header
          onLogin={() => navigation.navigate("Login")}     
          onRegister={() => navigation.navigate("Register")} 
        />
      ) : (
        //En móvil: se añade un margen superior (SafeAreaView)
        //para evitar que se solape con la barra de estado del dispositivo
        <SafeAreaView style={{ marginTop: 50 }}>
          <Header
            onLogin={() => navigation.navigate("Login")}
            onRegister={() => navigation.navigate("Register")}
          />
        </SafeAreaView>
      )}

      {/*CONTENIDO PRINCIPAL — Scroll general */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,                     
          justifyContent: "space-between",  
          backgroundColor: "#fff",          
        }}
      >
        {/*HERO BANNER — carrusel de imágenes intro */}
        <View
          style={{
            alignItems: "center",          
            justifyContent: "center",    
            width: "100%",                 
            backgroundColor: "#fff",       
            marginBottom: Platform.OS === "web" ? 0 : 20, 
          }}
        >
          {/*Componente HeroBanner */}
          <HeroBanner
            onNext={() => {
              //Acción al pulsar el botón “next” del banner
              //(por ahora te redirige a "Home")
              navigation.navigate("Home");
            }}
          />
        </View>
      </ScrollView>

      {/* FOOTER (solo visible en Web) */}
      {Platform.OS === "web" && <Footer />}
    </View>
  );
}

