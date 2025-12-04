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

export default function HeroBanner({ height }) {
  const { width } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(width);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  const slides = [
    require("../assets/romeria.jpg"),
    require("../assets/patrona_feria.jpg"),
    require("../assets/luna_lunera.jpg"),
    require("../assets/hipica.jpg"),
    require("../assets/grand_prix.jpg"),
    require("../assets/ciclismo.jpg"),
  ];

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

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    flatListRef.current?.scrollToOffset({
      offset: nextIndex * containerWidth,
      animated: true,
    });
    setCurrentIndex(nextIndex);

    if (Platform.OS !== "web") triggerAnimation();
  };

  useEffect(() => {
    if (Platform.OS !== "web") triggerAnimation();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => handleNext(), 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderItem = ({ item }) => {
    if (Platform.OS === "web") {
      // BREAKPOINTS
      const isMobile = containerWidth < 600;
      const isTablet = containerWidth >= 600 && containerWidth < 1024;

      // ESPACIOS IGUALES ARRIBA/ABAJO (siempre simétricos)
      const sliderHeight = isMobile
        ? height * 0.55
        : isTablet
        ? height * 0.60
        : height * 0.65;

      const whiteSpace = (height - sliderHeight) / 2;

      return (
        <View
          style={{
            width: containerWidth,
            height: height,
            backgroundColor: "#fff",
          }}
        >
          {/* ZONA BLANCA SUPERIOR */}
          <View style={{ height: whiteSpace, backgroundColor: "#fff" }} />

          {/* SLIDER */}
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

          {/* ZONA BLANCA INFERIOR */}
          <View style={{ height: whiteSpace, backgroundColor: "#fff" }} />
        </View>
      );
    }

    // MOBILE NATIVE (NO SE TOCA)
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
