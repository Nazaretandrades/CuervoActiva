// frontend/src/screens/UserProfile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Alert,
  Platform,
  Animated,
  ScrollView,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE =
  Platform.OS === "android"
    ? "http://192.168.18.19:5000" // ⚠️ cambia por tu IPv4 local
    : "http://localhost:5000";

export default function UserProfile() {
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [userName, setUserName] = useState("Usuario");

  /** === Cargar usuario logueado === */
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
          setForm({ name: session.name, email: session.email });
          setUserName(session.name);
        }
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };
    loadUser();
  }, []);

  /** === Guardar cambios en BD === */
  const handleSave = async () => {
    try {
      let session;
      if (Platform.OS === "web") {
        session = JSON.parse(localStorage.getItem("USER_SESSION"));
      } else {
        const s = await AsyncStorage.getItem("USER_SESSION");
        session = s ? JSON.parse(s) : null;
      }

      if (!session?.token) {
        Alert.alert("Error", "No se encontró la sesión del usuario.");
        return;
      }

      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar en la base de datos");

      const updatedUser = await res.json();

      const updatedSession = {
        ...session,
        name: updatedUser.name,
        email: updatedUser.email,
      };

      if (Platform.OS === "web") {
        localStorage.setItem("USER_SESSION", JSON.stringify(updatedSession));
      } else {
        await AsyncStorage.setItem(
          "USER_SESSION",
          JSON.stringify(updatedSession)
        );
      }

      Alert.alert("✅ Guardado", "Tu perfil ha sido actualizado correctamente.");
      setEditing(false);
      setUserName(updatedUser.name);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      Alert.alert("Error", err.message);
    }
  };

  /** === Cerrar sesión === */
  const handleLogout = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("USER_SESSION");
    } else {
      await AsyncStorage.removeItem("USER_SESSION");
    }
    navigation.navigate("Intro");
  };

  /** === Navegaciones === */
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

  /** === Menú lateral === */
  const toggleMenu = () => {
    if (Platform.OS !== "web") {
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

  /** === CABECERA IGUAL A NOTIFICACIONES === */
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
      {/* Perfil Usuario */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            position: "relative",
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
          <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
        </View>
      </View>

      {/* Iconos derecha */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/bell.png")}
            style={{ width: 22, height: 22, tintColor: "#014869" }}
          />
        </Pressable>

        {Platform.OS === "web" && (
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

  /** === Render principal === */
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {renderTopBar()}

      {/* === MENÚ WEB === */}
      {Platform.OS === "web" && menuVisible && (
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

      {/* === MENÚ MÓVIL (idéntico al de UserNotifications) === */}
      {menuVisible && Platform.OS !== "web" && (
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
          {/* 🔙 Header */}
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

          {/* 🔹 Opciones */}
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

          {/* 🔸 Barra inferior (hasta el borde) */}
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

      {/* === CONTENIDO PERFIL (diseño igual al organizador, pero azul) === */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "flex-start",
          paddingVertical: 65,
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            backgroundColor: "#f5f5f5",
            borderRadius: 8,
            width: "90%",
            maxWidth: 420,
            paddingVertical: 20,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 5,
            marginTop: 30,
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

          {/* Icono usuario */}
          <View
            style={{
              position: "relative",
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
            <TextInput
              editable={editing}
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 14,
                marginBottom: 15,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            />

            <Text
              style={{ fontWeight: "bold", color: "#014869", marginBottom: 5 }}
            >
              Email:
            </Text>
            <TextInput
              editable={editing}
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                paddingVertical: 8,
                paddingHorizontal: 14,
                marginBottom: 25,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginTop: 10,
              }}
            >
              <Pressable
                onPress={() => (editing ? handleSave() : setEditing(true))}
                style={{
                  backgroundColor: "#014869",
                  paddingVertical: 10,
                  paddingHorizontal: 25,
                  borderRadius: 30,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  {editing ? "Guardar" : "Editar"}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleLogout}
                style={{
                  backgroundColor: "#014869",
                  paddingVertical: 10,
                  paddingHorizontal: 25,
                  borderRadius: 30,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Cerrar Sesión
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* === FOOTER === */}
      {Platform.OS === "web" && (
        <Footer
          onAboutPress={goToAboutUs}
          onPrivacyPress={goToPrivacy}
          onConditionsPress={goToConditions}
        />
      )}
    </View>
  );
}
