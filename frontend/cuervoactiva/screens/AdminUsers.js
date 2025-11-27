import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  TextInput,
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

  const [toast, setToast] = useState({ visible: false, type: "", message: "" });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Modal eliminar usuario
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // 🔹 Modales crear / editar usuario
  const [createVisible, setCreateVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [editUser, setEditUser] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

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

  const goToProfile = () => navigation.navigate("AdminProfile");
  const goToNotifications = () => navigation.navigate("AdminNotifications");
  const goToAboutUs = () => navigation.navigate("SobreNosotros");
  const goToPrivacy = () => navigation.navigate("PoliticaPrivacidad");
  const goToConditions = () => navigation.navigate("Condiciones");
  const goToContact = () => navigation.navigate("Contacto");
  const goToCulturaHistoria = () => navigation.navigate("CulturaHistoria");
  const goToCalendar = () => navigation.navigate("Calendar");

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

  // 🔹 Abrir / cerrar modal CREAR usuario
  const openCreateModal = () => {
    setNewUser({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    });
    setCreateVisible(true);
  };

  const closeCreateModal = () => setCreateVisible(false);

  // 🔹 Abrir / cerrar modal EDITAR usuario
  const openEditModal = (user) => {
    setEditUser({
      id: user._id,
      name: user.name || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      role: user.role || "user",
    });
    setEditVisible(true);
  };

  const closeEditModal = () => setEditVisible(false);

  // 🔹 Crear usuario (POST /api/users/admin-create)
  const submitCreateUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password) {
      showToast("error", "Nombre, email y contraseña son obligatorios");
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      showToast("error", "Las contraseñas no coinciden");
      return;
    }

    try {
      const session = await getSession();
      const token = session?.token;

      const res = await fetch(`${API_URL}/admin-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "Error al crear el usuario");
        return;
      }

      // Añadimos el usuario a la lista sin perder los demás
      setUsers((prev) => [...prev, data]);
      closeCreateModal();
      showToast("success", "✅ Usuario creado correctamente");
    } catch (err) {
      showToast("error", "❌ Error al crear el usuario");
    }
  };

  // 🔹 Editar usuario (PUT /api/users/admin-update/:id)
  const submitEditUser = async () => {
    if (!editUser.name.trim() || !editUser.email.trim()) {
      showToast("error", "Nombre y email son obligatorios");
      return;
    }

    if (editUser.password || editUser.confirmPassword) {
      if (!editUser.password || !editUser.confirmPassword) {
        showToast(
          "error",
          "Si cambias la contraseña, rellena ambos campos de contraseña"
        );
        return;
      }
      if (editUser.password !== editUser.confirmPassword) {
        showToast("error", "Las contraseñas no coinciden");
        return;
      }
    }

    try {
      const session = await getSession();
      const token = session?.token;

      const payload = {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
      };
      if (editUser.password) {
        payload.password = editUser.password;
      }

      const res = await fetch(`${API_URL}/admin-update/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast("error", data.error || "Error al actualizar el usuario");
        return;
      }

      // Actualizamos en la lista
      setUsers((prev) =>
        prev.map((u) => (u._id === data._id ? data : u))
      );

      closeEditModal();
      showToast("success", "✅ Usuario actualizado correctamente");
    } catch (err) {
      showToast("error", "❌ Error al actualizar el usuario");
    }
  };

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

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "flex-start",
          paddingVertical: 40,
        }}
      >
        {/* Título + botón crear */}
        <View
          style={{
            width: "90%",
            maxWidth: 1300,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.title}>Usuarios</Text>

          <Pressable onPress={openCreateModal} style={styles.createButton}>
            <Text style={styles.createButtonText}>+ Crear usuario</Text>
          </Pressable>
        </View>

        <View style={styles.userContainer}>
          <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator>
            {users.length > 0 ? (
              users.map((u) => (
                <View key={u._id} style={styles.userCard}>
                  <View>
                    <Text style={styles.userName}>{u.name}</Text>
                    <Text style={styles.userEmail}>{u.email}</Text>
                    <Text style={styles.userRole}>
                      Rol: {u.role === "organizer" ? "Organizador" : "Usuario"}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Pressable
                      onPress={() => openEditModal(u)}
                      style={{ marginRight: 14 }}
                    >
                      <Image
                        source={require("../assets/iconos/editar.png")}
                        style={styles.editIcon}
                      />
                    </Pressable>

                    <Pressable onPress={() => openConfirmModal(u._id)}>
                      <Image
                        source={require("../assets/iconos/papelera.png")}
                        style={styles.trashIcon}
                      />
                    </Pressable>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noUsers}>No hay usuarios registrados.</Text>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {/* MODAL CONFIRMAR ELIMINAR */}
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

      {/* MODAL CREAR USUARIO */}
      {createVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Crear usuario</Text>

            <TextInput
              placeholder="Nombre"
              placeholderTextColor="#999"
              value={newUser.name}
              onChangeText={(t) => setNewUser((p) => ({ ...p, name: t }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={newUser.email}
              onChangeText={(t) => setNewUser((p) => ({ ...p, email: t }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#999"
              secureTextEntry
              value={newUser.password}
              onChangeText={(t) => setNewUser((p) => ({ ...p, password: t }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Repetir contraseña"
              placeholderTextColor="#999"
              secureTextEntry
              value={newUser.confirmPassword}
              onChangeText={(t) =>
                setNewUser((p) => ({ ...p, confirmPassword: t }))
              }
              style={styles.input}
            />

            <Text style={styles.label}>Rol</Text>
            <View style={styles.roleRow}>
              <Pressable
                onPress={() =>
                  setNewUser((p) => ({ ...p, role: "user" }))
                }
                style={[
                  styles.roleOption,
                  newUser.role === "user" && styles.roleOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    newUser.role === "user" && styles.roleOptionTextSelected,
                  ]}
                >
                  Usuario
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  setNewUser((p) => ({ ...p, role: "organizer" }))
                }
                style={[
                  styles.roleOption,
                  newUser.role === "organizer" && styles.roleOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    newUser.role === "organizer" &&
                      styles.roleOptionTextSelected,
                  ]}
                >
                  Organizador
                </Text>
              </Pressable>
            </View>

            <View style={[styles.modalButtons, { marginTop: 18 }]}>
              <Pressable
                onPress={closeCreateModal}
                style={styles.cancelButton}
              >
                <Text style={{ color: "#333", fontWeight: "bold" }}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable onPress={submitCreateUser} style={styles.saveButton}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Crear
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* MODAL EDITAR USUARIO */}
      {editVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Editar usuario</Text>

            <TextInput
              placeholder="Nombre"
              placeholderTextColor="#999"
              value={editUser.name}
              onChangeText={(t) => setEditUser((p) => ({ ...p, name: t }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={editUser.email}
              onChangeText={(t) => setEditUser((p) => ({ ...p, email: t }))}
              style={styles.input}
            />

            <Text style={styles.smallHint}>
              Contraseña (déjala vacía si no quieres cambiarla)
            </Text>
            <TextInput
              placeholder="Nueva contraseña (opcional)"
              placeholderTextColor="#999"
              secureTextEntry
              value={editUser.password}
              onChangeText={(t) => setEditUser((p) => ({ ...p, password: t }))}
              style={styles.input}
            />
            <TextInput
              placeholder="Repetir nueva contraseña"
              placeholderTextColor="#999"
              secureTextEntry
              value={editUser.confirmPassword}
              onChangeText={(t) =>
                setEditUser((p) => ({ ...p, confirmPassword: t }))
              }
              style={styles.input}
            />

            <Text style={styles.label}>Rol</Text>
            <View style={styles.roleRow}>
              <Pressable
                onPress={() =>
                  setEditUser((p) => ({ ...p, role: "user" }))
                }
                style={[
                  styles.roleOption,
                  editUser.role === "user" && styles.roleOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    editUser.role === "user" && styles.roleOptionTextSelected,
                  ]}
                >
                  Usuario
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  setEditUser((p) => ({ ...p, role: "organizer" }))
                }
                style={[
                  styles.roleOption,
                  editUser.role === "organizer" && styles.roleOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    editUser.role === "organizer" &&
                      styles.roleOptionTextSelected,
                  ]}
                >
                  Organizador
                </Text>
              </Pressable>
            </View>

            <View style={[styles.modalButtons, { marginTop: 18 }]}>
              <Pressable onPress={closeEditModal} style={styles.cancelButton}>
                <Text style={{ color: "#333", fontWeight: "bold" }}>
                  Cancelar
                </Text>
              </Pressable>
              <Pressable onPress={submitEditUser} style={styles.saveButton}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Guardar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {toast.visible && (
        <Animated.View
          style={[
            styles.toast,
            {
              backgroundColor:
                toast.type === "success" ? "#4CAF50" : "#E74C3C",
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
  userEmail: { color: "#e0e0e0", fontSize: 13 },
  userRole: { color: "#F3B23F", fontSize: 13, marginTop: 2 },
  trashIcon: { width: 22, height: 22, tintColor: "#fff" },
  editIcon: { width: 22, height: 22, tintColor: "#fff" },
  noUsers: { color: "#666", textAlign: "center", marginTop: 20 },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#014869",
  },

  createButton: {
    backgroundColor: "#F3B23F",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

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
    width: 340,
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
  saveButton: {
    backgroundColor: "#014869",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 14,
    color: "#333",
  },
  label: {
    alignSelf: "flex-start",
    marginBottom: 4,
    color: "#014869",
    fontWeight: "600",
  },
  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
  },
  roleOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  roleOptionSelected: {
    backgroundColor: "#014869",
    borderColor: "#014869",
  },
  roleOptionText: {
    color: "#014869",
    fontWeight: "600",
    fontSize: 13,
  },
  roleOptionTextSelected: {
    color: "#fff",
  },
  smallHint: {
    fontSize: 11,
    color: "#777",
    alignSelf: "flex-start",
    marginBottom: 4,
  },

  toast: {
    position: "absolute",
    bottom: 100,
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
});
