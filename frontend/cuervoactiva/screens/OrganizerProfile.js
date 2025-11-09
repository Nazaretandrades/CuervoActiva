// frontend/src/screens/OrganizerProfile.js
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
    ? "http://192.168.18.19:5000"
    : "http://localhost:5000";

export default function OrganizerProfile() {
  const navigation = useNavigation();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [organizerName, setOrganizerName] = useState("Organizador");

  // === Cargar usuario logueado ===
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
          setOrganizerName(session.name);
        }
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };
    loadUser();
  }, []);

  // === Guardar cambios ===
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
        Alert.alert("Error", "No se encontró la sesión del organizador.");
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

      Alert.alert(
        "✅ Guardado",
        "Tu perfil ha sido actualizado correctamente."
      );
      setEditing(false);
      setOrganizerName(updatedUser.name);
    } catch (err) {
      console.error("Error guardando perfil:", err);
      Alert.alert("Error", err.message);
    }
  };

  // === Cerrar sesión ===
  const handleLogout = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("USER_SESSION");
    } else {
      await AsyncStorage.removeItem("USER_SESSION");
    }
    navigation.navigate("Intro");
  };

  // === Navegaciones ===
  const goToProfile = () => navigation.navigate("OrganizerProfile");
  const goToNotifications = () => navigation.navigate("OrganizerNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");

  // === Menú lateral ===
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

  // === CABECERA IGUAL QUE EN NOTIFICACIONES ===
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
      {/* Perfil organizador */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            position: "relative",
            marginRight: 12,
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: "#F3B23F",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/iconos/user.png")}
            style={{ width: 24, height: 24, tintColor: "#fff" }}
          />
          <Image
            source={require("../assets/iconos/lapiz.png")}
            style={{
              position: "absolute",
              top: -4,
              left: -4,
              width: 22,
              height: 22,
              resizeMode: "contain",
              transform: [{ rotate: "-25deg" }],
            }}
          />
        </View>
        <View>
          <Text style={{ color: "#014869", fontWeight: "700", fontSize: 14 }}>
            Organiz.
          </Text>
          <Text style={{ color: "#6c757d", fontSize: 13 }}>
            {organizerName}
          </Text>
        </View>
      </View>

      {/* Iconos derecha */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/bell3.png")}
            style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
          />
        </Pressable>

        {Platform.OS === "web" && (
          <Pressable onPress={goToCalendar} style={{ marginRight: 18 }}>
            <Image
              source={require("../assets/iconos/calendar-organizador.png")}
              style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
            />
          </Pressable>
        )}

        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close-organizador.png")
                : require("../assets/iconos/menu-organizador.png")
            }
            style={{ width: 24, height: 24, tintColor: "#F3B23F" }}
          />
        </Pressable>
      </View>
    </View>
  );

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

      {/* === MENÚ MÓVIL IGUAL AL DE NOTIFICACIONES === */}
      {menuVisible && Platform.OS !== "web" && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#fff",
            zIndex: 20,
            justifyContent: "space-between",
          }}
        >
          {/* CABECERA DEL MENÚ MÓVIL */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 50,
              paddingBottom: 20,
            }}
          >
            <Pressable onPress={toggleMenu}>
              <Image
                source={require("../assets/iconos/back-organizador.png")}
                style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
              />
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#F3B23F" }}>
              Menú
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* OPCIONES DEL MENÚ MÓVIL */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: 40,
              justifyContent: "flex-start",
              gap: 30,
            }}
          >
            {[
              {
                label: "Sobre nosotros",
                icon: require("../assets/iconos/info-usuario.png"),
                action: goToAboutUs,
              },
              {
                label: "Cultura e Historia",
                icon: require("../assets/iconos/museo-usuario.png"),
                action: goToCulturaHistoria,
              },
              {
                label: "Contacto",
                icon: require("../assets/iconos/phone-usuario.png"),
                action: goToContact,
              },
            ].map((item, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  toggleMenu();
                  item.action();
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={item.icon}
                    style={{
                      width: 28,
                      height: 28,
                      tintColor: "#014869",
                      marginRight: 12,
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
                  style={{ width: 16, height: 16, tintColor: "#F3B23F" }}
                />
              </Pressable>
            ))}
          </View>

          {/* FOOTER INFERIOR DEL MENÚ MÓVIL */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              paddingVertical: 10,
              borderTopWidth: 1,
              borderColor: "#F3B23F",
              backgroundColor: "#fff",
            }}
          >
            <Pressable
              onPress={() => {
                const currentRoute =
                  navigation.getState().routes.slice(-1)[0].name || "Organizer";
                if (currentRoute === "Organizer") {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Organizer" }],
                  });
                } else {
                  navigation.navigate("Organizer");
                }
              }}
            >
              <Image
                source={require("../assets/iconos/home-organizador.png")}
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>

            <Pressable onPress={goToCalendar}>
              <Image
                source={require("../assets/iconos/calendar-organizador.png")}
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>

            <Pressable onPress={goToProfile}>
              <Image
                source={require("../assets/iconos/user.png")}
                style={{ width: 26, height: 26, tintColor: "#F3B23F" }}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* === CONTENIDO PERFIL === */}
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

          {/* Icono organizador */}
          <View
            style={{
              position: "relative",
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "#F3B23F",
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
              source={require("../assets/iconos/lapiz.png")}
              style={{
                position: "absolute",
                top: -4,
                left: -4,
                width: 22,
                height: 22,
                resizeMode: "contain",
                transform: [{ rotate: "-25deg" }],
              }}
            />
          </View>

          <View style={{ width: "80%" }}>
            <Text
              style={{ fontWeight: "bold", color: "#014869", marginBottom: 5 }}
            >
              Username:
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
