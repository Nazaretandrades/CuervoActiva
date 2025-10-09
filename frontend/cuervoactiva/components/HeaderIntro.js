import React from "react";
import { View, Text, Pressable, Image } from "react-native";

export default function Header({ onLogin, onRegister }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      {/* Izquierda: Logo + nombre */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={require("../assets/logo.png")}
          style={{ width: 28, height: 28, marginRight: 8 }}
        />
        <Text>CUERVO ACTIVA</Text>
      </View>

      {/* Derecha: Botones */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={onLogin} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <Text>Iniciar Sesión</Text>
        </Pressable>
        <Pressable onPress={onRegister} style={{ paddingHorizontal: 8, paddingVertical: 6 }}>
          <Text>Registrarse</Text>
        </Pressable>
      </View>
    </View>
  );
}
