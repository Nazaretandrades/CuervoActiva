// Pantalla del perfil del usuario
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  Alert,
  Platform,
  Animated,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";


// URL base según entorno local o producción
const LOCAL_API =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";
  
const API_BASE =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL || LOCAL_API;



// Declaro el componente
export default function UserProfile() {
  // Estados
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [userData, setUserData] = useState({ name: "Usuario", email: "" });
  const [editVisible, setEditVisible] = useState(false);
  const [newName, setNewName] = useState("");

  /* Responsive */
  const [winWidth, setWinWidth] = useState(
    Platform.OS === "web" ? window.innerWidth : Dimensions.get("window").width
  );

  // Función para redimensionar en tiempo real
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const resize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Breakpoints
  const isWeb = Platform.OS === "web";
  const isMobileWeb = isWeb && winWidth < 768;
  const isTabletWeb = isWeb && winWidth >= 768 && winWidth < 1024;
  const isLaptopWeb = isWeb && winWidth >= 1024 && winWidth < 1440;
  const isDesktopWeb = isWeb && winWidth >= 1440;
  const isLargeWeb = isLaptopWeb || isDesktopWeb;
  const pagePaddingHorizontal = isMobileWeb
    ? 20
    : isTabletWeb
    ? 40
    : isLaptopWeb
    ? 55
    : 80;
  const pagePaddingBottom = isLargeWeb ? 100 : 40;
  const profileContainerWidth = isMobileWeb
    ? "92%"
    : isTabletWeb
    ? "85%"
    : isLaptopWeb
    ? "60%"
    : "45%";

  /* Cargar la sesión */
  useEffect(() => {
    const loadUser = async () => {
      try {
        let session;

        if (Platform.OS === "web") {
          session = JSON.parse(localStorage.getItem("USER_SESSION"));
        } else {
          const s = await AsyncStorage.getItem("USER_SESSION");
          session = s ? JSON.parse(s) : null;
        }

        if (session?.name && session?.email) {
          setUserData({ name: session.name, email: session.email });
        }
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };
    loadUser();
  }, []);

  /* Cerrar sesión */
  const handleLogout = async () => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem("USER_SESSION");
      } else {
        await AsyncStorage.removeItem("USER_SESSION");
      }
      navigation.navigate("Intro");
    } catch (err) {
      Alert.alert("Error", "No se pudo cerrar sesión correctamente.");
    }
  };

  /* Edit modal */
  const openEditModal = () => {
    setNewName(userData.name);
    setEditVisible(true);
  };

  // Guardar los cambios del perfil
  const saveProfileChanges = async () => {
    try {
      if (!newName.trim()) {
        Alert.alert("Error", "El nombre no puede estar vacío.");
        return;
      }

      let session =
        Platform.OS === "web"
          ? JSON.parse(localStorage.getItem("USER_SESSION"))
          : JSON.parse(await AsyncStorage.getItem("USER_SESSION"));

      if (!session) {
        Alert.alert("Error", "Sesión no encontrada.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error || "No se pudo actualizar el perfil.");
        return;
      }

      setUserData((prev) => ({ ...prev, name: data.name }));

      const updatedSession = { ...session, name: data.name };

      if (Platform.OS === "web") {
        localStorage.setItem("USER_SESSION", JSON.stringify(updatedSession));
      } else {
        await AsyncStorage.setItem(
          "USER_SESSION",
          JSON.stringify(updatedSession)
        );
      }

      setEditVisible(false);
      Alert.alert("Éxito", "Nombre actualizado correctamente.");
    } catch (err) {
      console.error("Error:", err);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    }
  };

  /* Navegaciones */
  const goToProfile = () => navigation.navigate("UserProfile");
  const goToNotifications = () => navigation.navigate("UserNotifications");
  const goToFavorites = () => navigation.navigate("UserFavorites");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToHome = () => navigation.navigate("User");

  /* Menú */
  const toggleMenu = () => {
    if (!isWeb) {
      setMenuVisible(!menuVisible);
      return;
    }

    if (menuVisible) {
      Animated.timing(menuAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  /* Cabecera */
  const renderTopBar = () => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 14,
        justifyContent: "space-between",
        backgroundColor: "#fff",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            marginRight: 12,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#014869",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/iconos/user.png")}
            style={{ width: 24, height: 24, tintColor: "#fff" }}
          />
        </View>

        <View>
          <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
            Usuario
          </Text>
          <Text style={{ color: "#6c757d", fontSize: 13 }}>
            {userData.name}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: 22, height: 22, tintColor: "#014869" }}
          />
        </Pressable>

        {isWeb && (
          <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
            <Image
              source={require("../assets/iconos/calendar.png")}
              style={{ width: 22, height: 22, tintColor: "#014869" }}
            />
          </Pressable>
        )}

        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close.png")
                : require("../assets/iconos/menu-usuario.png")
            }
            style={{ width: 24, height: 24, tintColor: "#014869" }}
          />
        </Pressable>
      </View>
    </View>
  );

  /* Render */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {/* Cabecera */}
      {renderTopBar()}

      {/* Menú web */}
      {isWeb && menuVisible && (
        <Animated.View
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: 250,
            height: "100%",
            backgroundColor: "#f8f8f8",
            padding: 20,
            zIndex: 10,
            transform: [{ translateX: menuAnim }],
            boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          }}
        >
          {[
            { label: "Perfil", action: goToProfile },
            { label: "Cultura e Historia", action: goToCulturaHistoria },
            { label: "Ver favoritos", action: goToFavorites },
            { label: "Contacto", action: goToContact },
          ].map((item, i) => (
            <Pressable
              key={i}
              onPress={() => {
                toggleMenu();
                item.action();
              }}
              style={{ marginBottom: 25 }}
            >
              <Text
                style={{
                  color: "#014869",
                  fontSize: 18,
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      )}

      {/* Menú móvil */}
      {menuVisible && !isWeb && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#f4f6f7",
            zIndex: 20,
            paddingHorizontal: 24,
            paddingTop: 50,
          }}
        >
          {/* Cabecera */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            <Pressable onPress={toggleMenu} style={{ marginRight: 15 }}>
              <Image
                source={require("../assets/iconos/back-usuario.png")}
                style={{ width: 22, height: 22, tintColor: "#014869" }}
              />
            </Pressable>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#014869",
                textAlign: "center",
                flex: 1,
                marginRight: 37,
              }}
            >
              Menú
            </Text>
          </View>

          {/* Opciones */}
          <View style={{ flex: 1 }}>
            {[
              {
                label: "Cultura e Historia",
                icon: require("../assets/iconos/museo-usuario.png"),
                action: goToCulturaHistoria,
              },
              {
                label: "Sobre nosotros",
                icon: require("../assets/iconos/info-usuario.png"),
                action: goToAboutUs,
              },
              {
                label: "Ver favoritos",
                icon: require("../assets/iconos/favs-usuario.png"),
                action: goToFavorites,
              },
              {
                label: "Contacto",
                icon: require("../assets/iconos/phone-usuario.png"),
                action: goToContact,
              },
            ].map((item, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  toggleMenu();
                  item.action();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 25,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={item.icon}
                    style={{
                      width: 22,
                      height: 22,
                      tintColor: "#014869",
                      marginRight: 14,
                    }}
                  />
                  <Text
                    style={{
                      color: "#014869",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
                <Image
                  source={require("../assets/iconos/siguiente.png")}
                  style={{ width: 18, height: 18, tintColor: "#014869" }}
                />
              </Pressable>
            ))}
          </View>

          {/* Bottom del menú móvil */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              borderTopWidth: 2,
              borderTopColor: "#01486999",
              paddingVertical: 14,
              backgroundColor: "#fff",
            }}
          >
            <Pressable onPress={goToHome}>
              <Image
                source={require("../assets/iconos/home-usuario.png")}
                style={{ width: 24, height: 24, tintColor: "#014869" }}
              />
            </Pressable>
            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar.png")}
                style={{ width: 24, height: 24, tintColor: "#014869" }}
              />
            </Pressable>
            <Pressable onPress={goToProfile}>
              <Image
                source={require("../assets/iconos/user.png")}
                style={{ width: 24, height: 24, tintColor: "#014869" }}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* Perfil */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: Platform.OS === "web" ? pagePaddingBottom : 65,
          paddingHorizontal: Platform.OS === "web" ? pagePaddingHorizontal : 20,
          backgroundColor: "#f5f6f7",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 8,
            width: Platform.OS === "web" ? profileContainerWidth : "90%",
            maxWidth: Platform.OS === "web" ? "100%" : 420,
            paddingVertical: 20,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 5,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#014869",
              marginBottom: 15,
            }}
          >
            Perfil
          </Text>

          <View
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "#014869",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 36, height: 36, tintColor: "#fff" }}
            />
          </View>

          <View style={{ width: "80%" }}>
            <Text
              style={{ fontWeight: "bold", color: "#014869", marginBottom: 5 }}
            >
              Nombre:
            </Text>
            <Text
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 14,
                marginBottom: 15,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              {userData.name}
            </Text>

            <Text
              style={{ fontWeight: "bold", color: "#014869", marginBottom: 5 }}
            >
              Email:
            </Text>
            <Text
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 14,
                marginBottom: 25,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              {userData.email}
            </Text>

            <Pressable
              onPress={openEditModal}
              style={{
                backgroundColor: "#014869",
                paddingVertical: 10,
                paddingHorizontal: 25,
                borderRadius: 30,
                alignSelf: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Editar perfil
              </Text>
            </Pressable>

            <Pressable
              onPress={handleLogout}
              style={{
                backgroundColor: "#014869",
                paddingVertical: 10,
                paddingHorizontal: 25,
                borderRadius: 30,
                alignSelf: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Cerrar Sesión
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal editar perfil */}
      {editVisible && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <View
            style={{
              width: 320,
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#014869",
                marginBottom: 10,
              }}
            >
              Editar perfil
            </Text>

            <Text style={{ marginBottom: 6, color: "#014869" }}>
              Nuevo nombre:
            </Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Nombre"
              placeholderTextColor="#999"
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginBottom: 15,
                color: "#333",
              }}
            />

            <Pressable
              onPress={saveProfileChanges}
              style={{
                backgroundColor: "#014869",
                paddingVertical: 10,
                borderRadius: 30,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Guardar cambios
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setEditVisible(false)}
              style={{
                paddingVertical: 10,
                borderRadius: 30,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#014869", fontWeight: "bold" }}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/**Footer */}
      {isWeb && isLargeWeb && (
        <Footer
          onAboutPress={goToAboutUs}
          onPrivacyPress={goToPrivacy}
          onConditionsPress={goToConditions}
        />
      )}
    </View>
  );
}
