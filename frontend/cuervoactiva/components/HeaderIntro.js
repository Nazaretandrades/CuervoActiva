//HEADER INTRO

//1) Importamos los módulos necesarios
import React from "react";
import { View, Text, Pressable, Image } from "react-native";

//2) Definición del componente funcional Header
//Este componente recibe dos props (funciones):
//- onLogin: qué hacer cuando el usuario pulsa “Iniciar Sesión”
//- onRegister: qué hacer cuando el usuario pulsa “Registrarse”
export default function Header({ onLogin, onRegister }) {
  return (
    //Contenedor principal del header
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      {/*IZQUIERDA: Logo + nombre de la app */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/*Logo de la app */}
        <Image
          source={require("../assets/logo.png")}
          style={{
            width: 28,
            height: 28,
            marginRight: 8,
          }}
        />

        {/*Texto con el nombre de la app */}
        <Text>CUERVO ACTIVA</Text>
      </View>

      {/*DERECHA: Botones de navegación (Login / Register) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/*Botón de Iniciar Sesión */}
        <Pressable
          onPress={onLogin} //Ejecuta la función recibida por prop al pulsar
          style={{
            paddingHorizontal: 8,
            paddingVertical: 6,
          }}
        >
          <Text>Iniciar Sesión</Text>
        </Pressable>

        {/*Botón de Registrarse */}
        <Pressable
          onPress={onRegister} //Ejecuta la función recibida por prop al pulsar
          style={{
            paddingHorizontal: 8,
            paddingVertical: 6,
          }}
        >
          <Text>Registrarse</Text>
        </Pressable>
      </View>
    </View>
  );
}
