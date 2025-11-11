import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  StyleSheet,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const API_BASE =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const API_URL = `${API_BASE}/api/users`;

export default function AdminUsers() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [adminName, setAdminName] = useState("Admin");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));

  //  TOAST (igual al login)
  const [toast, setToast] = useState({ visible: false, type: "", message: "" });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showToast = (type, message) => {
    setToast({ visible: true, type, message });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast({ visible: false, type: "", message: "" }));
    }, 3000);
  };

  //  MODAL DE CONFIRMACIÓN
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const openConfirmModal = (userId) => {
    setUserToDelete(userId);
    setConfirmVisible(true);
  };

  const closeConfirmModal = () => {
    setUserToDelete(null);
    setConfirmVisible(false);
  };

  //  SESIÓN
  const getSession = async () => {
    try {
      if (Platform.OS === "web") {
        return JSON.parse(localStorage.getItem("USER_SESSION"));
      } else {
        const s = await AsyncStorage.getItem("USER_SESSION");
        return s ? JSON.parse(s) : null;
      }
    } catch {
      return null;
    }
  };

  //  CARGAR USUARIOS
  const loadUsers = async () => {
    try {
      const session = await getSession();
      const token = session?.token;
      if (session?.name) setAdminName(session.name);

      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsers(data);
    } catch {
      showToast("error", "⚠️ No se pudieron cargar los usuarios");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // NAVEGACIONES
  const goToProfile = () => navigation.navigate("AdminProfile");
  const goToNotifications = () => navigation.navigate("AdminNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");

  // ELIMINAR USUARIO
  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const session = await getSession();
      const token = session?.token;

      const res = await fetch(`${API_URL}/${userToDelete}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al eliminar usuario");
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete));
      closeConfirmModal();
      showToast("success", "🗑️ Usuario eliminado correctamente");
    } catch {
      closeConfirmModal();
      showToast("error", "❌ Error al eliminar el usuario");
    }
  };

  //  MENÚ LATERAL
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

  //  CABECERA ADMIN IGUAL QUE CULTURA
  const renderAdminTopBar = () => (
    <View style={styles.topBar}>
      {/* Perfil Admin */}
      <View style={styles.adminInfo}>
        <View style={styles.adminIconContainer}>
          <Image
            source={require("../assets/iconos/user.png")}
            style={styles.userIcon}
          />
          <Image
            source={require("../assets/iconos/corona.png")}
            style={styles.crownIcon}
          />
        </View>
        <View>
          <Text style={styles.adminTitle}>Admin.</Text>
          <Text style={styles.adminName}>{adminName}</Text>
        </View>
      </View>

      {/* Iconos derecha */}
      <View style={styles.iconRow}>
        <Pressable onPress={goToNotifications} style={styles.iconButton}>
          <Image
            source={require("../assets/iconos/bell2.png")}
            style={styles.topIcon}
          />
        </Pressable>
        <Pressable onPress={goToCalendar} style={styles.iconButton}>
          <Image
            source={require("../assets/iconos/calendar-admin.png")}
            style={styles.topIcon}
          />
        </Pressable>
        <Pressable onPress={toggleMenu}>
          <Image
            source={
              menuVisible
                ? require("../assets/iconos/close-admin.png")
                : require("../assets/iconos/menu-admin.png")
            }
            style={styles.topIcon}
          />
        </Pressable>
      </View>
    </View>
  );

  //  MENÚ LATERAL
  const renderAdminMenu = () =>
    Platform.OS === "web" &&
    menuVisible && (
      <>
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[styles.sideMenu, { transform: [{ translateX: menuAnim }] }]}
        >
          {[
            { label: "Perfil", action: goToProfile },
            { label: "Cultura e Historia", action: goToCulturaHistoria },
            { label: "Ver usuarios", action: () => {} },
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
              <Text style={styles.menuItem}>{item.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      </>
    );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header hideAuthButtons />
      {renderAdminTopBar()}
      {renderAdminMenu()}

      {/* === CONTENIDO === */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "flex-start",
          paddingVertical: 40,
        }}
      >
        <Text style={styles.title}>Usuarios</Text>

        <View style={styles.userContainer}>
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator>
            {users.length > 0 ? (
              users.map((u) => (
                <View key={u._id} style={styles.userCard}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Pressable onPress={() => openConfirmModal(u._id)}>
                    <Image
                      source={require("../assets/iconos/papelera.png")}
                      style={styles.trashIcon}
                    />
                  </Pressable>
                </View>
              ))
            ) : (
              <Text style={styles.noUsers}>No hay usuarios registrados.</Text>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/*  MODAL DE CONFIRMACIÓN  */}
      {confirmVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>
              ¿Seguro que deseas eliminar este usuario?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={closeConfirmModal}
                style={styles.cancelButton}
              >
                <Text style={{ color: "#333", fontWeight: "bold" }}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.deleteButton}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Eliminar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/*  TOAST  */}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toast,
            {
              backgroundColor: toast.type === "success" ? "#4CAF50" : "#E74C3C",
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}

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

// === ESTILOS ===
const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  adminInfo: { flexDirection: "row", alignItems: "center" },
  adminIconContainer: {
    position: "relative",
    marginRight: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0094A2",
    alignItems: "center",
    justifyContent: "center",
  },
  userIcon: { width: 24, height: 24, tintColor: "#fff" },
  crownIcon: {
    position: "absolute",
    top: -12,
    left: -6,
    width: 22,
    height: 22,
    resizeMode: "contain",
  },
  adminTitle: { color: "#014869", fontWeight: "700", fontSize: 14 },
  adminName: { color: "#6c757d", fontSize: 13 },
  iconRow: { flexDirection: "row", alignItems: "center" },
  iconButton: { marginRight: 20 },
  topIcon: { width: 22, height: 22, tintColor: "#0094A2" },

  // Contenedor principal de usuarios
  userContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxWidth: 1300,
    alignSelf: "center",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    marginTop: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#014869",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 12,
  },
  userName: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  trashIcon: { width: 22, height: 22, tintColor: "#fff" },
  noUsers: { color: "#666", textAlign: "center", marginTop: 20 },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#014869",
  },

  // Menú lateral
  sideMenu: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 250,
    height: "100%",
    backgroundColor: "#f8f8f8",
    padding: 20,
    zIndex: 10,
  },
  menuItem: { color: "#014869", fontSize: 18, fontWeight: "700" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 9,
  },

  // Modal
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 200,
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    width: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#014869",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  // Toast
  // Toast
  toast: {
    position: "absolute",
    bottom: 100, // 🔼 antes 40 → ahora más arriba para no tapar el footer
    left: "5%",
    right: "5%",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  toastText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 15,
  },
  toastText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 15,
  },
});
