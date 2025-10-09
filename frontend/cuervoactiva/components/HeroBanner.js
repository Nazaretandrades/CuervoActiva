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

export default function HeroBanner({ onNext }) {
  const { width: screenWidth } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState(screenWidth);
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

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % slides.length;
    flatListRef.current?.scrollToOffset({
      offset: nextIndex * containerWidth,
      animated: true,
    });
    setCurrentIndex(nextIndex);
    if (Platform.OS !== "web") triggerAnimation();
  };

  // 🔹 Animación fade-up para móvil
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

  useEffect(() => {
    if (Platform.OS !== "web") triggerAnimation();
  }, []);

  const renderItem = ({ item }) => {
    if (Platform.OS === "web") {
      // 💻 WEB: igual que ya tienes
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
          <Image
            source={item}
            style={styles.blurredBackground}
            blurRadius={30}
            resizeMode="cover"
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
            <View style={{ maxWidth: "70%" }}>
              <Text style={styles.title}>CUERVO ACTIVA</Text>
              <Text style={styles.subtitle}>
                Tu guía digital para vivir las tradiciones{"\n"}y la cultura de
                nuestro pueblo.
              </Text>
            </View>

            <Pressable onPress={handleNext} style={styles.button}>
              <Image
                source={require("../assets/iconos/next.png")}
                style={{ width: 18, height: 18, tintColor: "#fff" }}
              />
            </Pressable>
          </View>
        </View>
      );
    } else {
      // 📱 MÓVIL: versión vertical + animada
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
            resizeMode="cover"
          />
          <Image
            source={item}
            style={{
              width: "100%",
              height: 400,
              resizeMode: "contain",
              zIndex: 2,
            }}
          />
          <View style={styles.overlay} />

          {/* Animación fade-up del texto y botón */}
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

            <Pressable onPress={handleNext} style={styles.button}>
              <Image
                source={require("../assets/iconos/next.png")}
                style={{ width: 18, height: 18, tintColor: "#fff" }}
              />
            </Pressable>
          </Animated.View>
        </View>
      );
    }
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
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 3,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    position: "absolute",
    zIndex: 4,
    width: "100%",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f7931e",
    alignItems: "center",
    justifyContent: "center",
  },
});
