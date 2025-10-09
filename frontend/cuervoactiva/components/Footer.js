import React from "react";
import { View, Text, Pressable } from "react-native";

export default function Footer() {
  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#ddd",
        backgroundColor: "#fff",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Izquierda: copyright + enlaces */}
        <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
          <Text style={{ marginRight: 8 }}>© 2025 CuervoActiva, Inc.</Text>

          <Pressable style={{ marginHorizontal: 6 }}>
            <Text>Privacidad</Text>
          </Pressable>

          <Pressable style={{ marginHorizontal: 6 }}>
            <Text>Condiciones</Text>
          </Pressable>

          <Pressable style={{ marginHorizontal: 6 }}>
            <Text>Sobre Nosotros</Text>
          </Pressable>
        </View>

        {/* Derecha: idioma + iconos */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable style={{ paddingHorizontal: 6 }}>
            <Text>Español (ES)</Text>
          </Pressable>
          <Pressable style={{ paddingHorizontal: 6 }}>
            <Text>FB</Text>
          </Pressable>
          <Pressable style={{ paddingHorizontal: 6 }}>
            <Text>IG</Text>
          </Pressable>
          <Pressable style={{ paddingHorizontal: 6 }}>
            <Text>X</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
