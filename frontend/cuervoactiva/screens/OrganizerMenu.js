import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function OrganizerMenu({ onClose }) {
  const navigation = useNavigation();

  const goToAbout = () => {
    onClose?.();
    navigation.navigate("SobreNosotros");
  };
  const goToCulturaHistoria = () => {
    onClose?.();
    navigation.navigate("CulturaHistoria");
  };
  const goToContact = () => {
    onClose?.();
    navigation.navigate("Contacto");
  };
  const goToCalendar = () => {
    onClose?.();
    navigation.navigate("Calendar");
  };
  const goToProfile = () => {
    onClose?.();
    navigation.navigate("OrganizerProfile");
  };
  const goToHomeOrganizador = () => {
    onClose?.();
    navigation.navigate("Organizer");
  };

  return (
    <View style={styles.container}>
      {/*  CABECERA */}
      <View style={styles.header}>
        <Pressable onPress={onClose}>
          <Image
            source={require("../assets/iconos/back-organizador.png")}
            style={styles.backIcon}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Menú</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* OPCIONES DEL MENÚ */}
      <View style={styles.menuOptions}>
        <Pressable style={styles.option} onPress={goToAbout}>
          <View style={styles.optionLeft}>
            <Image
              source={require("../assets/iconos/info-usuario.png")}
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Sobre nosotros</Text>
          </View>
          <Image
            source={require("../assets/iconos/siguiente.png")}
            style={styles.arrowIcon}
          />
        </Pressable>

        <Pressable style={styles.option} onPress={goToCulturaHistoria}>
          <View style={styles.optionLeft}>
            <Image
              source={require("../assets/iconos/museo-usuario.png")}
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Cultura e Historia</Text>
          </View>
          <Image
            source={require("../assets/iconos/siguiente.png")}
            style={styles.arrowIcon}
          />
        </Pressable>

        <Pressable style={styles.option} onPress={goToContact}>
          <View style={styles.optionLeft}>
            <Image
              source={require("../assets/iconos/phone-usuario.png")}
              style={styles.optionIcon}
            />
            <Text style={styles.optionText}>Contacto</Text>
          </View>
          <Image
            source={require("../assets/iconos/siguiente.png")}
            style={styles.arrowIcon}
          />
        </Pressable>
      </View>

      {/* BARRA INFERIOR */}
      {Platform.OS !== "web" && (
        <View style={styles.bottomBar}>
          <Pressable onPress={goToHomeOrganizador}>
            <Image
              source={require("../assets/iconos/home-organizador.png")}
              style={styles.bottomIcon}
            />
          </Pressable>

          <Pressable onPress={goToCalendar}>
            <Image
              source={require("../assets/iconos/calendar-organizador.png")}
              style={styles.bottomIcon}
            />
          </Pressable>

          <Pressable onPress={goToProfile}>
            <Image
              source={require("../assets/iconos/user.png")}
              style={styles.bottomIcon}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#F3B23F",
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: "#F3B23F",
  },
  menuOptions: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "flex-start",
    gap: 30,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionIcon: {
    width: 28,
    height: 28,
    tintColor: "#014869",
  },
  optionText: {
    color: "#014869",
    fontSize: 16,
    fontWeight: "600",
  },
  arrowIcon: {
    width: 16,
    height: 16,
    tintColor: "#F3B23F",
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#F3B23F",
    backgroundColor: "#fff",
  },
  bottomIcon: {
    width: 26,
    height: 26,
    tintColor: "#F3B23F",
  },
});
