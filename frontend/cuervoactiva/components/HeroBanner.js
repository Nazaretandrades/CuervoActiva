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


export default function HeroBanner() {
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

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIndex]);


  const renderItem = ({ item }) => {
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
          <Image
            source={item}
            style={styles.blurredBackground}
            blurRadius={20}
            resizeMode="cover"
          />

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

          <View style={styles.overlay} />

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
