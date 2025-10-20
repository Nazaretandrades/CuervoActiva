
//PANTALLA PRINCIPAL
//1) Importaciones necesarias
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Animated,
} from "react-native";

//2) Componente principal HeroBanner
export default function HeroBanner({ onNext }) {
  //Obtenemos el ancho actual de la pantalla
  const { width: screenWidth } = useWindowDimensions();

  //Estado que guarda el ancho del contenedor (por si se redimensiona)
  const [containerWidth, setContainerWidth] = useState(screenWidth);

  //Índice de la imagen actual (posición del carrusel)
  const [currentIndex, setCurrentIndex] = useState(0);

  //Referencia al FlatList (para mover el carrusel manualmente)
  const flatListRef = useRef(null);

  //3) Configuración de animaciones (solo en móvil)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current; //desplazamiento vertical (de abajo hacia arriba)

  //4) Array de imágenes (slides del carrusel)
  const slides = [
    require("../assets/romeria.jpg"),
    require("../assets/patrona_feria.jpg"),
    require("../assets/luna_lunera.jpg"),
    require("../assets/hipica.jpg"),
    require("../assets/grand_prix.jpg"),
    require("../assets/ciclismo.jpg"),
  ];

  //5) Función para pasar a la siguiente imagen
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % slides.length; //Calcula siguiente slide (vuelve al inicio al llegar al final)

    //Mueve el FlatList al siguiente slide
    flatListRef.current?.scrollToOffset({
      offset: nextIndex * containerWidth,
      animated: true,
    });

    setCurrentIndex(nextIndex);

    //Solo dispara la animación en móvil
    if (Platform.OS !== "web") triggerAnimation();
  };

  //&) Función que ejecuta la animación "fade + movimiento"
  const triggerAnimation = () => {
    fadeAnim.setValue(0);
    translateAnim.setValue(20);

    Animated.parallel([
      //Animación de opacidad (aparecer)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      //Animación de movimiento vertical (subir)
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  //Ejecuta la animación la primera vez (solo móvil)
  useEffect(() => {
    if (Platform.OS !== "web") triggerAnimation();
  }, []);

  //7) Renderizado de cada imagen (item del carrusel)
  const renderItem = ({ item }) => {
    //Versión WEB
    if (Platform.OS === "web") {
      return (
        <View
          style={{
            width: containerWidth,
            height: 520,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 150,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Fondo borroso expandido */}
          <Image
            source={item}
            style={styles.blurredBackground}
            blurRadius={30}
            resizeMode="cover"
          />

          {/* Imagen principal centrada */}
          <Image
            source={item}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "contain",
              zIndex: 2,
            }}
          />

          {/* Capa semitransparente para oscurecer el fondo */}
          <View style={styles.overlay} />

          {/* Texto + botón */}
          <View style={styles.content}>
            <View style={{ maxWidth: "70%" }}>
              <Text style={styles.title}>CUERVO ACTIVA</Text>
              <Text style={styles.subtitle}>
                Tu guía digital para vivir las tradiciones{"\n"}y la cultura de
                nuestro pueblo.
              </Text>
            </View>

            {/* Botón siguiente */}
            <Pressable onPress={handleNext} style={styles.button}>
              <Image
                source={require("../assets/iconos/next.png")}
                style={{ width: 18, height: 18, tintColor: "#ffffffff" }}
              />
            </Pressable>
          </View>
        </View>
      );
    }

    //Versión MÓVIL (con animación fade-up)
    return (
      <View
        style={{
          width: containerWidth,
          height: 550,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 60,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Fondo borroso */}
        <Image
          source={item}
          style={styles.blurredBackground}
          blurRadius={15}
          resizeMode="cover"
        />

        {/* Imagen principal (centrada verticalmente) */}
        <Image
          source={item}
          style={{
            width: "100%",
            height: 400,
            resizeMode: "contain",
            zIndex: 2,
          }}
        />

        {/* Capa de oscurecimiento */}
        <View style={styles.overlay} />

        {/* Contenido animado (texto + botón) */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 40,
            alignItems: "center",
            zIndex: 5,
            opacity: fadeAnim, //controlado por animación
            transform: [{ translateY: translateAnim }],
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: "bold",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            CUERVO ACTIVA
          </Text>

          <Text
            style={{
              color: "#fff",
              fontSize: 15,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 16,
            }}
          >
            Tu guía digital para vivir las tradiciones{"\n"}y la cultura de
            nuestro pueblo.
          </Text>

          {/* Botón siguiente */}
          <Pressable onPress={handleNext} style={styles.button}>
            <Image
              source={require("../assets/iconos/next.png")}
              style={{ width: 18, height: 18, tintColor: "#fff" }}
            />
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  //8) FlatList — Carrusel de imágenes horizontal
  return (
    <View
      style={{ width: "100%", overflow: "hidden" }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToAlignment="center"
        snapToInterval={containerWidth}
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false} //Control manual (botón "next")
        getItemLayout={(_, index) => ({
          length: containerWidth,
          offset: containerWidth * index,
          index,
        })}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / containerWidth
          );
          setCurrentIndex(index);
          if (Platform.OS !== "web") triggerAnimation(); //Reinicia animación
        }}
      />
    </View>
  );
}

//9) Estilos comunes
const styles = StyleSheet.create({
  //Fondo difuminado (borroso)
  blurredBackground: {
    position: "absolute",
    width: "110%",
    height: "110%",
    top: "-5%",
    left: "-5%",
    opacity: 0.9,
  },

  //Capa oscura semitransparente
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 3,
  },

  //Contenedor del texto + botón (en versión web)
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    position: "absolute",
    zIndex: 4,
    width: "100%",
  },

  //Título principal
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },

  //Subtítulo
  subtitle: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },

  //Botón circular “next”
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f7931e",
    alignItems: "center",
    justifyContent: "center",
  },
});
