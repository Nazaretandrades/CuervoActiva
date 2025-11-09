// frontend/src/screens/CulturaHistoria.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Platform,
  StyleSheet,
  Animated,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import OrganizerMenu from "./OrganizerMenu";
import UserMenu from "./UserMenu";

export default function CulturaHistoria() {
  const [role, setRole] = useState("user");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [userName, setUserName] = useState("Usuario");

  const nav = useNavigation();

  useEffect(() => {
    const loadSession = async () => {
      try {
        let session;
        if (Platform.OS === "web") {
          session = JSON.parse(localStorage.getItem("USER_SESSION"));
        } else {
          const s = await AsyncStorage.getItem("USER_SESSION");
          session = s ? JSON.parse(s) : null;
        }
        if (session?.user?.role) setRole(session.user.role);
        else if (session?.role) setRole(session.role);
        if (session?.name) setUserName(session.name);
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };
    loadSession();
  }, []);

  // === Navegaciones ===
  const goToProfile = () =>
    role === "admin"
      ? nav.navigate("AdminProfile")
      : role === "organizer"
      ? nav.navigate("OrganizerProfile")
      : nav.navigate("UserProfile");
  const goToNotifications = () =>
    role === "admin"
      ? nav.navigate("AdminNotifications")
      : role === "organizer"
      ? nav.navigate("OrganizerNotifications")
      : nav.navigate("UserNotifications");
  const goToAboutUs = () => nav.navigate("SobreNosotros");
  const goToPrivacy = () => nav.navigate("PoliticaPrivacidad");
  const goToConditions = () => nav.navigate("Condiciones");
  const goToContact = () => nav.navigate("Contacto");
  const goToCulturaHistoria = () => nav.navigate("CulturaHistoria");
  const goToCalendar = () => nav.navigate("Calendar");
  const goToHomeUser = () => nav.navigate("User");

  // === Menú lateral ===
  const toggleMenu = () => {
    if (Platform.OS !== "web") {
      setMenuVisible(!menuVisible);
      return;
    }

    if (!menuVisible) {
      setMenuVisible(true);
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(menuAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    }
  };

  /** === CABECERA USER === */
  const renderUserTopBar = () => (
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
          <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
        </View>
      </View>

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

  /** === CABECERA ORGANIZER === */
  const renderOrganizerTopBar = () => (
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
            backgroundColor: "#F3B23F",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source={require("../assets/iconos/user.png")}
            style={{ width: 24, height: 24, tintColor: "#fff" }}
          />
          {/* 🔸 Icono del lápiz encima */}
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
            Organizador
          </Text>
          <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
        </View>
      </View>

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

  /** === CABECERA ADMIN === */
  const renderAdminTopBar = () => (
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
          <Text style={{ color: "#6c757d", fontSize: 13 }}>{userName}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Pressable
          onPress={goToNotifications}
          style={{
            marginRight: 20,
            ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
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
            ...(Platform.OS === "web" ? { cursor: "pointer" } : {}),
          }}
        >
          <Image
            source={require("../assets/iconos/calendar-admin.png")}
            style={{ width: 22, height: 22, tintColor: "#0094A2" }}
          />
        </Pressable>

        <Pressable
          onPress={toggleMenu}
          style={Platform.OS === "web" ? { cursor: "pointer" } : {}}
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
  );

  /** === MENÚ LATERAL WEB === */
  const renderWebMenu = () => {
    if (!menuVisible || Platform.OS !== "web") return null;

    let menuItems = [];

    if (role === "user") {
      menuItems = [
        { label: "Perfil", action: () => nav.navigate("UserProfile") },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        { label: "Ver favoritos", action: () => nav.navigate("UserFavorites") },
        { label: "Contacto", action: goToContact },
      ];
    } else if (role === "organizer") {
      menuItems = [
        { label: "Perfil", action: () => nav.navigate("OrganizerProfile") },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        { label: "Contacto", action: goToContact },
      ];
    } else if (role === "admin") {
      menuItems = [
        { label: "Perfil", action: () => nav.navigate("AdminProfile") },
        { label: "Cultura e Historia", action: goToCulturaHistoria },
        { label: "Ver usuarios", action: () => nav.navigate("AdminUsers") },
        { label: "Contacto", action: goToContact },
      ];
    }

    return (
      <>
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View
            style={{
              position: "fixed",
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
          {menuItems.map((item, i) => (
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
      </>
    );
  };

  // === CONTENIDO ===
  return (
    <View style={styles.pageContainer}>
      <Header hideAuthButtons />

      {role === "user" && renderUserTopBar()}
      {role === "organizer" && renderOrganizerTopBar()}
      {role === "admin" && renderAdminTopBar()}

      {renderWebMenu()}

      {/* === MENÚ MÓVIL (igual que en Contacto.js) === */}
      {Platform.OS !== "web" &&
        menuVisible &&
        (role === "organizer" ? (
          <OrganizerMenu onClose={toggleMenu} />
        ) : role === "user" ? (
          <UserMenu onClose={toggleMenu} />
        ) : null)}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 20,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator
        nestedScrollEnabled
      >
        <Text style={styles.title}>Cultura e Historia</Text>
        <Text style={styles.paragraph}>
          El Cuervo de Sevilla, situado en la comarca del Bajo Guadalquivir, fue
          parte de Lebrija hasta finales del siglo XX. Su independencia se
          alcanzó el 19 de diciembre de 1992 tras un movimiento popular que
          marcó un antes y un después en la historia local.{"\n\n"}
          Sus orígenes modernos se remontan al siglo XVIII, gracias a su
          ubicación junto a la antigua calzada romana Vía Augusta —hoy la N-4—,
          donde existía una Casa de Postas que servía de punto de descanso entre
          Cádiz y Sevilla.{"\n\n"}
        </Text>

        <View
          style={[
            styles.eventContainer,
            Platform.OS !== "web" && styles.eventContainerMobile,
          ]}
        >
          {Platform.OS === "web" ? (
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator>
              {events.map((evt, i) => (
                <View key={i}>
                  <View style={styles.eventCard}>
                    <Image source={evt.image} style={styles.eventImage} />
                    <View style={styles.eventTextContainer}>
                      <Text style={styles.eventTitle}>{evt.title}</Text>
                      <Text style={styles.eventText}>{evt.description}</Text>
                    </View>
                  </View>
                  {i !== events.length - 1 && <View style={styles.separator} />}
                </View>
              ))}
            </ScrollView>
          ) : (
            events.map((evt, i) => (
              <View key={i}>
                <View style={styles.eventCardMobile}>
                  <Image source={evt.image} style={styles.eventImageMobile} />
                  <Text style={styles.eventTitle}>{evt.title}</Text>
                  <Text style={styles.eventText}>{evt.description}</Text>
                </View>
                {i !== events.length - 1 && <View style={styles.separator} />}
              </View>
            ))
          )}
        </View>
      </ScrollView>

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

// === Eventos con texto ampliado ===
const events = [
  {
    title: "Feria de El Cuervo de Sevilla",
    image: require("../assets/feria.jpg"),
    description:
      "La Feria de El Cuervo de Sevilla se celebra cada año en honor a la Virgen del Rosario, patrona del municipio. Durante varios días, las calles se llenan de farolillos, risas y música, mientras las casetas acogen a familias y amigos que disfrutan de comidas típicas, vino fino y sevillanas hasta altas horas de la noche. Es una fiesta que combina tradición, color y hospitalidad. Los vecinos visten trajes de flamenca y de corto, y los caballos desfilan elegantes por el recinto ferial. Las noches culminan con espectáculos musicales, concursos y fuegos artificiales, convirtiendo la feria en el evento social y cultural más esperado del año por todos los cuerveños y visitantes.",
  },
  {
    title: "Semana Santa",
    image: require("../assets/semana_santa.jpg"),
    description:
      "La Semana Santa de El Cuervo de Sevilla es un periodo de intensa emoción y espiritualidad. Las hermandades procesionan por las calles acompañadas por el sonido solemne de los tambores y las saetas que brotan del alma del pueblo. Las imágenes, talladas con esmero y devoción, reflejan la profunda fe de generaciones. Las procesiones nocturnas, iluminadas por el resplandor de los cirios, recorren el corazón del municipio mientras el silencio de los asistentes solo se rompe por el paso rítmico de los costaleros. Esta semana no solo representa un evento religioso, sino también una manifestación cultural y artística que une a los vecinos en torno a la tradición, el respeto y la identidad local.",
  },
  {
    title: "Romería de la Virgen del Rosario",
    image: require("../assets/romeria.jpg"),
    description:
      "La Romería en honor a la Virgen del Rosario es uno de los acontecimientos más entrañables de El Cuervo. En esta jornada, los devotos acompañan a la patrona en su recorrido hacia el campo, entre cánticos, palmas y flores. Carretas decoradas con mimo, caballos engalanados y peregrinos vestidos con trajes típicos crean una estampa de alegría y devoción. Familias y amigos comparten comidas campestres, cantan sevillanas y viven un ambiente de fraternidad difícil de igualar. Es un día en el que la fe y la tradición se dan la mano, fortaleciendo los lazos de unión y el orgullo por las raíces cuerveñas.",
  },
  {
    title: "Día del Pan",
    image: require("../assets/dia_pan.jpg"),
    description:
      "El Día del Pan es una celebración única en El Cuervo que rinde homenaje a uno de los símbolos más representativos del municipio: su pan artesanal, conocido por su sabor y calidad excepcionales. Durante esta jornada, los panaderos locales abren las puertas de sus obradores para mostrar el proceso tradicional de elaboración, desde el amasado hasta el horneado. Los visitantes pueden degustar diferentes variedades de pan y dulces típicos, participar en talleres y conocer la historia de una tradición que ha pasado de generación en generación. Además, la fiesta incluye actuaciones musicales, actividades para niños, muestras gastronómicas y exposiciones sobre el oficio panadero, destacando la importancia cultural y económica de este producto para el pueblo.",
  },
  {
    title: "Fiestas Patronales de la Virgen del Rosario",
    image: require("../assets/patrona_feria.jpg"),
    description:
      "Las Fiestas Patronales en honor a la Virgen del Rosario son el broche de oro del calendario festivo de El Cuervo. Durante varios días, el municipio se llena de alegría, fe y tradición. Las calles se adornan con flores y banderines, y los vecinos participan en misas, procesiones y actos religiosos en los que la patrona recorre el pueblo entre aplausos y vítores. Junto a las actividades religiosas, el programa incluye conciertos, pasacalles, competiciones deportivas y actividades culturales para todas las edades. Es un tiempo de reencuentros, en el que muchos cuerveños que viven fuera regresan para celebrar junto a familiares y amigos. Las fiestas patronales son un reflejo del amor y la devoción del pueblo por su Virgen, símbolo de esperanza, unión y orgullo local.",
  },
];

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
    minHeight: "100vh",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#014869",
    textAlign: "center",
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "justify",
  },
  eventContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 20,
    width: "200%",
    maxWidth: 1500,
    alignSelf: "center",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    marginTop: 25,
  },
  eventContainerMobile: {
    width: "100%",
    maxWidth: "100%",
    padding: 16,
    boxShadow: undefined,
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    alignItems: "flex-start",
  },
  eventCardMobile: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    alignItems: "center",
  },
  eventImage: {
    width: 140,
    height: 100,
    borderRadius: 8,
    marginRight: 18,
    resizeMode: "cover",
  },
  eventImageMobile: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover",
  },
  eventTextContainer: { flex: 1 },
  eventTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#014869",
    marginBottom: 6,
  },
  eventText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    textAlign: "justify",
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
});
