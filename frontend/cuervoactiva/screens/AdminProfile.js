// Pantalla del perfil del administrador
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  TextInput,
  Dimensions,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { useNavigation } from "@react-navigation/native";
import { getSession, saveSession } from "../services/sessionManager";
import Constants from "expo-constants";

// URL local según plataforma
const LOCAL_API =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000"
    : "http://localhost:5000";

// API final: en producción usa EXPO_PUBLIC_API_URL; en desarrollo usa LOCAL_API
const API_BASE =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_API_URL ||
  LOCAL_API;


// Se declara el componente
export default function AdminProfile() {
  // Estados
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [adminData, setAdminData] = useState({ name: "Admin", email: "" });
  const [editVisible, setEditVisible] = useState(false);
  const [newName, setNewName] = useState("");

  /* Breakpoints */
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

  /* =Cargar Usuario */
  useEffect(() => {
    const loadUser = () => {
      try {
        const session = JSON.parse(
          Platform.OS === "web" ? localStorage.getItem("USER_SESSION") : null
        );
        if (session?.name && session?.email) {
          setAdminData({ name: session.name, email: session.email });
        }
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };

    loadUser();

    if (Platform.OS === "web") {
      window.addEventListener("storage", loadUser);
      return () => window.removeEventListener("storage", loadUser);
    }
  }, []);

  /* Cerrar sesión */
  const handleLogout = async () => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem("USER_SESSION");
        localStorage.removeItem("SEEN_INTRO");
      }
      navigation.reset({
        index: 0,
        routes: [{ name: "Intro" }],
      });
    } catch (err) {
      console.error("Error cerrando sesión:", err);
      Alert.alert("Error", "No se pudo cerrar sesión correctamente.");
    }
  };

  /* Editar el perfil */
  const openEditModal = () => {
    setNewName(adminData.name || "");
    setEditVisible(true);
  };

  // Guardar los cambios del perfil
  const saveProfileChanges = async () => {
    try {
      // Comprobar que el nombre no puede estar vacío
      if (!newName.trim()) {
        Alert.alert("Error", "El nombre no puede estar vacío.");
        return;
      }
      // Obtengo la sesión
      const session = await getSession();
      if (!session?.token) {
        Alert.alert("Error", "Sesión no encontrada.");
        return;
      }
      // Hago el fetch
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      const data = await res.json();
      // Obtengo la respuesta
      if (!res.ok) {
        Alert.alert("Error", data.error || "No se pudo actualizar el perfil.");
        return;
      }
      // Actualizo el nombre de usuario y lo guardo
      setAdminData((prev) => ({ ...prev, name: data.name }));
      await saveSession({ ...session, name: data.name });
      setEditVisible(false);
      Alert.alert("Éxito", "Nombre actualizado correctamente.");
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    }
  };

  /* Navegación */
  const goToProfile = () => navigation.navigate("AdminProfile");
  const goToNotifications = () => navigation.navigate("AdminNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");
  const goToUsers = () => navigation.navigate("AdminUsers");

  /* Menu */
  const toggleMenu = () => {
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

  /* UI */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />

      {/* Cabecera */}
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
              position: "relative",
              marginRight: 12,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#0094A2",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 24, height: 24, tintColor: "#fff" }}
            />
            <Image
              source={require("../assets/iconos/corona.png")}
              style={{
                position: "absolute",
                top: -12,
                left: -6,
                width: 22,
                height: 22,
                resizeMode: "contain",
              }}
            />
          </View>

          <View>
            <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
              Admin.
            </Text>
            <Text
              key={adminData.name}
              style={{ color: "#6c757d", fontSize: 13 }}
            >
              {adminData.name}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={goToNotifications}
            style={{
              marginRight: 20,
              ...(isWeb ? { cursor: "pointer" } : {}),
            }}
          >
            <Image
              source={require("../assets/iconos/bell2.png")}
              style={{ width: 22, height: 22, tintColor: "#0094A2" }}
            />
          </Pressable>

          <Pressable
            onPress={goToCalendar}
            style={{
              marginRight: 20,
              ...(isWeb ? { cursor: "pointer" } : {}),
            }}
          >
            <Image
              source={require("../assets/iconos/calendar-admin.png")}
              style={{ width: 22, height: 22, tintColor: "#0094A2" }}
            />
          </Pressable>

          <Pressable
            onPress={toggleMenu}
            style={isWeb ? { cursor: "pointer" } : {}}
          >
            <Image
              source={
                menuVisible
                  ? require("../assets/iconos/close-admin.png")
                  : require("../assets/iconos/menu-admin.png")
              }
              style={{ width: 24, height: 24, tintColor: "#0094A2" }}
            />
          </Pressable>
        </View>
      </View>

      {/* Menu lateral web */}
      {isWeb && menuVisible && (
        <>
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 9,
              }}
            />
          </TouchableWithoutFeedback>

          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 250,
              height: "100%",
              backgroundColor: "#f8f8f8",
              padding: 20,
              zIndex: 10,
              transform: [{ translateX: menuAnim }],
            }}
          >
            {[
              { label: "Perfil", action: goToProfile },
              { label: "Cultura e Historia", action: goToCulturaHistoria },
              { label: "Ver usuarios", action: goToUsers },
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
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        </>
      )}

      {/* Contenido */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: pagePaddingBottom,
          paddingHorizontal: pagePaddingHorizontal,
          backgroundColor: "#f5f6f7",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 8,
            width: profileContainerWidth,
            paddingVertical: 20,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 5,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#014869",
              marginBottom: 15,
            }}
          >
            Perfil
          </Text>

          {/* Avatar */}
          <View
            style={{
              position: "relative",
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "#0094A2",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Image
              source={require("../assets/iconos/user.png")}
              style={{ width: 36, height: 36, tintColor: "#fff" }}
            />
            <Image
              source={require("../assets/iconos/corona.png")}
              style={{
                position: "absolute",
                top: -14,
                left: -4,
                width: 26,
                height: 26,
                resizeMode: "contain",
              }}
            />
          </View>

          <View style={{ width: "85%" }}>
            <Text
              style={{ fontWeight: "bold", color: "#014869", marginBottom: 5 }}
            >
              Username:
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
              {adminData.name}
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
              {adminData.email}
            </Text>

            {/* Botón de editar */}
            <Pressable
              onPress={openEditModal}
              style={{
                backgroundColor: "#0094A2",
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

            {/* Cerrar Sesión */}
            <Pressable
              onPress={handleLogout}
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
                Cerrar Sesión
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Modal de editar */}
      {editVisible && (
        <View
          style={{
            position: "fixed",
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
                backgroundColor: "#0094A2",
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
      {/**Footer responsive en web */}
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
