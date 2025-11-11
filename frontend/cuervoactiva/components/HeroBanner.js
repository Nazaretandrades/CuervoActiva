import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Animated,
} from "react-native";

/**
 * Componente: HeroBanner
 * Carrusel animado que muestra imágenes destacadas del pueblo o eventos culturales.
 * Se adapta automáticamente a web y móvil, con efectos de transición y texto superpuesto.
 */
export default function HeroBanner() {
  // Detectamos el ancho de la pantalla para ajustar el tamaño del carrusel
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(screenWidth);

  // Control del índice actual de la imagen mostrada
  const [currentIndex, setCurrentIndex] = useState(0);

  // Referencia al FlatList (para controlar el scroll programáticamente)
  const flatListRef = useRef(null);

  // Animaciones (solo se aplican en móvil)
  const fadeAnim = useRef(new Animated.Value(0)).current; // Opacidad
  const translateAnim = useRef(new Animated.Value(20)).current; // Movimiento vertical

  /**
   * Array de imágenes que se muestran en el carrusel
   * (importadas desde los assets locales del proyecto)
   */
  const slides = [
    require("../assets/romeria.jpg"),
    require("../assets/patrona_feria.jpg"),
    require("../assets/luna_lunera.jpg"),
    require("../assets/hipica.jpg"),
    require("../assets/grand_prix.jpg"),
    require("../assets/ciclismo.jpg"),
  ];

  /**
   * handleNext()
   * Avanza automáticamente a la siguiente imagen del carrusel.
   * Si llega al final, vuelve al principio.
   */
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    flatListRef.current?.scrollToOffset({
      offset: nextIndex * containerWidth,
      animated: true,
    });
    setCurrentIndex(nextIndex);

    // Dispara animación en móviles
    if (Platform.OS !== "web") triggerAnimation();
  };

  /**
   * triggerAnimation()
   * Ejecuta la animación de entrada del texto (fade + movimiento).
   */
  const triggerAnimation = () => {
    fadeAnim.setValue(0);
    translateAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * 🔹 Efecto inicial: ejecuta animación al montar el componente
   */
  useEffect(() => {
    if (Platform.OS !== "web") triggerAnimation();
  }, []);

  /**
   * Intervalo automático del carrusel (cada 4 segundos cambia la imagen)
   */
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  /**
   * renderItem()
   * Renderiza cada slide del carrusel.
   * Se diferencia entre versión web (mayor tamaño, texto lateral)
   * y móvil (texto centrado y animado).
   */
  const renderItem = ({ item }) => {
    // 💻 VERSIÓN WEB
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
          {/* Fondo difuminado */}
          <Image
            source={item}
            style={styles.blurredBackground}
            blurRadius={20}
            resizeMode="cover"
          />

          {/* Imagen principal */}
          <Image
            source={item}
            style={{
              width: "100%",
              height: "100%",
              resizeMode: "contain",
              zIndex: 2,
              borderRadius: 10,
            }}
          />

          {/* Capa semitransparente encima de la imagen */}
          <View style={styles.overlay} />

          {/* Texto superpuesto */}
          <View style={styles.content}>
            <View style={{ maxWidth: "70%" }}>
              <Text style={styles.title}>CUERVO ACTIVA</Text>
              <Text style={styles.subtitle}>
                Tu guía digital para vivir las tradiciones{"\n"}y la cultura de
                nuestro pueblo.
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // 📱 VERSIÓN MÓVIL
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
        {/* Fondo difuminado */}
        <Image
          source={item}
          style={styles.blurredBackground}
          blurRadius={15}
          resizeMode="cover"
        />

        {/* Imagen principal */}
        <Image
          source={item}
          style={{
            width: "100%",
            height: "100%",
            resizeMode: "contain",
            zIndex: 2,
            borderRadius: 15,
          }}
        />

        {/* Capa semitransparente oscura */}
        <View style={styles.overlay} />

        {/* Texto animado con fade + desplazamiento */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 40,
            alignItems: "center",
            zIndex: 5,
            opacity: fadeAnim,
            transform: [{ translateY: translateAnim }],
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 30,
              fontWeight: "900",
              marginBottom: 8,
              textAlign: "center",
              fontFamily:
                Platform.OS === "web" ? "'Bebas Neue', sans-serif" : undefined,
              letterSpacing: 2,
            }}
          >
            CUERVO ACTIVA
          </Text>

          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 16,
            }}
          >
            Tu guía digital para vivir las tradiciones{"\n"}y la cultura de
            nuestro pueblo.
          </Text>
        </Animated.View>
      </View>
    );
  };

  /**
   * FlatList
   * Componente que renderiza el carrusel horizontal de imágenes.
   * Está configurado para hacer scroll automático sin interacción del usuario.
   */
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
        scrollEnabled={false} // Bloquea scroll manual
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
          if (Platform.OS !== "web") triggerAnimation();
        }}
      />
    </View>
  );
}

/**
 * Estilos generales
 * Se aplican tanto a móvil como a web.
 */
const styles = StyleSheet.create({
  blurredBackground: {
    position: "absolute",
    width: "110%",
    height: "110%",
    top: "-5%",
    left: "-5%",
    opacity: 0.9,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 3,
  },
  content: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: 40,
    position: "absolute",
    zIndex: 4,
    width: "100%",
  },
  title: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 2,
    fontFamily: Platform.OS === "web" ? "'Bebas Neue', sans-serif" : undefined,
  },
  subtitle: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
});
