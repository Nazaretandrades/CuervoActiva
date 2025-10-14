//FOOTER

//1) Importamos los módulos necesarios de React Native
import React from "react";
import { View, Text, Pressable } from "react-native";

//2) Definimos el componente funcional Footer
export default function Footer() {
  return (
    //Contenedor principal del footer
    <View
      style={{
        paddingHorizontal: 20,    
        paddingVertical: 10,       
        borderTopWidth: 1,         
        borderTopColor: "#ddd",    
        backgroundColor: "#fff",   
      }}
    >
      {/*Estructura principal: fila con dos bloques (izquierda y derecha) */}
      <View
        style={{
          flexDirection: "row",            
          alignItems: "center",            
          justifyContent: "space-between", 
        }}
      >
        {/*IZQUIERDA: Copyright + enlaces */}
        <View
          style={{
            flexDirection: "row",     
            alignItems: "center",     
            flexWrap: "wrap",         
          }}
        >
          {/*Texto de copyright */}
          <Text style={{ marginRight: 8 }}>© 2025 CuervoActiva, Inc.</Text>

          {/*Enlaces del footer */}
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

        {/*DERECHA: Idioma + iconos de redes */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/*Idioma */}
          <Pressable style={{ paddingHorizontal: 6 }}>
            <Text>Español (ES)</Text>
          </Pressable>

          {/*Redes sociales — FB, IG, X (Twitter) */}
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

// =========================================================
// 🧠 RESUMEN DEL COMPONENTE
// =========================================================
// Este componente crea un pie de página (footer) con:
// - Una barra superior gris que lo separa del contenido
// - Información de derechos de autor y enlaces informativos
// - En la derecha, un selector de idioma y enlaces a redes sociales
//
// Se usa en la parte inferior de pantallas como Register, Intro, etc.
// =========================================================
