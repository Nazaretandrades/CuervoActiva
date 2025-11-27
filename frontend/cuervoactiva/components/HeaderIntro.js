import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Platform,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function Header({
  onLogin,
  onRegister,
  hideAuthButtons = false, 
}) {
  const navigation = useNavigation(); 
  const { width } = useWindowDimensions(); 
  const isMobile = width < 768; 

  const [roleColor, setRoleColor] = useState("#02486b");
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      try {
        let session;

        if (Platform.OS === "web") {
          session = JSON.parse(localStorage.getItem("USER_SESSION"));
        } 
        else {
          const sessionString = await AsyncStorage.getItem("USER_SESSION");
          session = sessionString ? JSON.parse(sessionString) : null;
        }

        const role =
          session?.user?.role || session?.role || session?.userType || "user";
        setUserRole(role);

        if (role === "admin") setRoleColor("#0094A2"); 
        else if (role === "organizer" || role === "organizador")
          setRoleColor("#F3B23F"); 
        else setRoleColor("#02486b"); 
      } catch (err) {
        console.error("Error detectando rol:", err);
      }
    };

    loadRole();
  }, []);

  const handleLogoPress = async () => {
    try {
      let session;
      if (Platform.OS === "web") {
        session = JSON.parse(localStorage.getItem("USER_SESSION"));
      } else {
        const sessionString = await AsyncStorage.getItem("USER_SESSION");
        session = sessionString ? JSON.parse(sessionString) : null;
      }

      if (!session || !session.token) {
        navigation.navigate("Intro");
        return;
      }

      const role =
        session.user?.role || session.role || session.userType || "user";

      if (role === "admin") navigation.navigate("Admin");
      else if (role === "organizer" || role === "organizador")
        navigation.navigate("Organizer");
      else navigation.navigate("User");
    } catch {
      navigation.navigate("Intro");
    }
  };

  const styles = {
    container: {
      backgroundColor: "#02486b",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: isMobile ? 14 : 24,
      paddingVertical: isMobile ? 10 : 18,
      width: "100%",
    },
    logoContainer: {
      width: isMobile ? 38 : 50,
      height: isMobile ? 38 : 50,
      marginRight: isMobile ? 6 : 10,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: "#fff",
    },
    logo: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    title: {
      color: "#fff",
      fontWeight: "700",
      fontSize: isMobile ? 15 : 17,
      letterSpacing: 0.6,
    },
    button: {
      backgroundColor: "#F3B23F",
      paddingVertical: isMobile ? 5 : 8,
      paddingHorizontal: isMobile ? 10 : 14,
      borderRadius: 6,
      marginRight: isMobile ? 8 : 12,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    buttonText: {
      color: "#fff",
      fontSize: isMobile ? 12 : 14,
      fontWeight: "600",
    },
    separatorRole: {
      height: 5,
      backgroundColor: roleColor,
      width: "100%",
    },
  };

  if (Platform.OS === "android" || Platform.OS === "ios") {
    return (
      <View style={{ backgroundColor: "#fff" }}>
        <SafeAreaView
          style={{
            backgroundColor: "#02486b",
            paddingTop:
              Platform.OS === "android" ? StatusBar.currentHeight || 15 : 0,
            borderBottomColor: roleColor,
            borderBottomWidth: 5, 
          }}
        >
          <View style={styles.container}>
            <Pressable
              onPress={handleLogoPress}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View style={styles.logoContainer}>
                <Image
                  source={require("../assets/logo.png")}
                  style={styles.logo}
                />
              </View>
            </Pressable>

            {!hideAuthButtons && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Pressable
                  onPress={onLogin}
                  android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && { backgroundColor: "#d99b30" },
                  ]}
                >
                  <Text style={styles.buttonText}>Iniciar Sesión</Text>
                </Pressable>

                <Pressable
                  onPress={onRegister}
                  android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && { backgroundColor: "#d99b30" },
                  ]}
                >
                  <Text style={styles.buttonText}>Registrarse</Text>
                </Pressable>
              </View>
            )}
          </View>
        </SafeAreaView>

        <View style={styles.separatorWhite} />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Pressable
          onPress={handleLogoPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <View style={styles.logoContainer}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
          </View>
          <Text style={styles.title}>CUERVO ACTIVA</Text>
        </Pressable>

        {!hideAuthButtons && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable onPress={onLogin} style={styles.button}>
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            </Pressable>

            <Pressable onPress={onRegister} style={styles.button}>
              <Text style={styles.buttonText}>Registrarse</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.separatorWhite} />
      <View style={styles.separatorRole} />
    </>
  );
}
