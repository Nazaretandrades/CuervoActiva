// Banner principal (slider)
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
// Declaro el componente
export default function HeroBanner({ height }) {
  // Dimensiones y estados
  const { width } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(width); 
  const [currentIndex, setCurrentIndex] = useState(0); // Índice actual del slide
  const flatListRef = useRef(null); // Referencia para desplazar el slider programáticamente

  // Animaciones 
  // fadeAnim controla la opacidad
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // translateAnim controla un deslizamiento vertical sutil del texto
  const translateAnim = useRef(new Animated.Value(20)).current;

  // Array de las imágenes del slider
  const slides = [
    require("../assets/romeria.jpg"),
    require("../assets/patrona_feria.jpg"),
    require("../assets/luna_lunera.jpg"),
    require("../assets/hipica.jpg"),
    require("../assets/grand_prix.jpg"),
    require("../assets/ciclismo.jpg"),
  ];

  // Función para activar animaciones (solo móvil)
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

  // Hace que vuelva al inicio cuando llega al final
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    // Desplaza el carrusel horizontalmente
    flatListRef.current?.scrollToOffset({
      offset: nextIndex * containerWidth,
      animated: true,
    });
    // Actualiza el índice
    setCurrentIndex(nextIndex);

    // La animación solo ocurre en móvil
    if (Platform.OS !== "web") triggerAnimation();
  };

  // Ejecutar la animación solo una vez al montar
  useEffect(() => {
    if (Platform.OS !== "web") triggerAnimation();
  }, []);

  // Slider automático, cada 4 segundos.
  useEffect(() => {
    const interval = setInterval(() => handleNext(), 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  // Función para renderizar cada slide
  const renderItem = ({ item }) => {
    if (Platform.OS === "web") {
      // Breakpoints
      const isMobile = containerWidth < 600;
      const isTablet = containerWidth >= 600 && containerWidth < 1024;

      // Cálculo dinámico del tamaño del slider
      const sliderHeight = isMobile
        ? height * 0.55
        : isTablet
        ? height * 0.60
        : height * 0.65;
      // Espacio blanco arriba y abajo
      const whiteSpace = (height - sliderHeight) / 2;

      // Versión web
      return (
        <View
          style={{
            width: containerWidth,
            height: height,
            backgroundColor: "#fff",
          }}
        >
          {/* Zona blanca superior */}
          <View style={{ height: whiteSpace, backgroundColor: "#fff" }} />

          {/* Slider */}
          <View
            style={{
              width: containerWidth,
              height: sliderHeight,
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Image
              source={item}
              style={styles.blurredBackground}
              blurRadius={20}
            />

            <Image
              source={item}
              style={{
                width: "100%",
                height: "100%",
                resizeMode: "contain",
                zIndex: 2,
              }}
            />

            <View style={styles.overlay} />

            {/* Contenido de texto */}
            <View style={styles.content}>
              <View style={{ maxWidth: isMobile ? "90%" : "70%" }}>
                <Text
                  style={[
                    styles.title,
                    { fontSize: isMobile ? 30 : 42 },
                  ]}
                >
                  CUERVO ACTIVA
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    {
                      fontSize: isMobile ? 14 : 16,
                      lineHeight: isMobile ? 20 : 22,
                    },
                  ]}
                >
                  Tu guía digital para vivir las tradiciones{"\n"}y la cultura de
                  nuestro pueblo.
                </Text>
              </View>
            </View>
          </View>

          {/* Zona blanca inferior */}
          <View style={{ height: whiteSpace, backgroundColor: "#fff" }} />
        </View>
      );
    }

    // Móvil nativo
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
        <Image
          source={item}
          style={styles.blurredBackground}
          blurRadius={15}
        />

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

        <View style={styles.overlay} />

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

  return (
    <View
      style={{ width: "100%", overflow: "hidden" }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {/**FlatList configurada como carrusel */}
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
        scrollEnabled={false}
      />
    </View>
  );
}

// Estilos
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
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    color: "#fff",
  },
});
