// Pantalla de Cultura e Historia
import React, { useState, useEffect } from "react";
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
  Dimensions,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import OrganizerMenu from "./OrganizerMenu";
import UserMenu from "./UserMenu";

// Declaración del componente
export default function CulturaHistoria() {
  // Estados
  const [role, setRole] = useState("user");
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnim] = useState(new Animated.Value(-250));
  const [userName, setUserName] = useState("Usuario");
  // Responsive web
  const [winWidth, setWinWidth] = useState(
    Platform.OS === "web" ? window.innerWidth : Dimensions.get("window").width
  );
  // Función para redimensionar en tiempo real
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleResize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isWeb = Platform.OS === "web";

  // Breakpoints
  const isMobileWeb = isWeb && winWidth < 768;
  const isTabletWeb = isWeb && winWidth >= 768 && winWidth < 1024;
  const isLaptopWeb = isWeb && winWidth >= 1024 && winWidth < 1440;
  const isLargeWeb = isWeb && winWidth >= 1024;
  const showFooter = isLaptopWeb || isLargeWeb;
  //  Breakpoints móviles pequeños y grandes SOLO WEB
  const isMobileSmall = isWeb && winWidth < 400;
  const isMobileMedium = isWeb && winWidth >= 400 && winWidth < 500;
  const isMobileLarge = isWeb && winWidth >= 500 && winWidth < 768;
  // Tamaño dinámico del párrafo SOLO móvil web
  const paragraphFontSize = isMobileSmall
    ? 14
    : isMobileMedium
    ? 15
    : isMobileLarge
    ? 16
    : 16;

  // ALtura scroll eventos
  const eventScrollMaxHeight = isMobileWeb
    ? 250
    : isTabletWeb
    ? 180
    : isLaptopWeb
    ? 220
    : 280;

  // Ancho del contenedor
  const eventContainerResponsiveStyle = !isWeb
    ? {}
    : isMobileWeb
    ? { width: "100%", maxWidth: "100%" }
    : isTabletWeb
    ? { width: "90%", maxWidth: 1000 }
    : { width: "60%", maxWidth: 1200 };

  // Navegación
  const nav = useNavigation();
  // Cargar usuario
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

  // Navegaciones
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
  const goToAbout = () => navigation.navigate("SobreNosotros");

  // Menu
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

  // Cabecera del usuario
  const renderUserTopBar = () => (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        <View style={[styles.avatarCircle, { backgroundColor: "#014869" }]}>
          <Image
            source={require("../assets/iconos/user.png")}
            style={{ width: 24, height: 24, tintColor: "#fff" }}
          />
        </View>
        <View>
          <Text style={styles.topBarRole}>Usuario</Text>
          <Text style={styles.topBarName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.topBarRight}>
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

  // Cabecera del organizador
  const renderOrganizerTopBar = () => (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: "#F3B23F", position: "relative" },
          ]}
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
          <Text style={styles.topBarRole}>Organizador</Text>
          <Text style={styles.topBarName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.topBarRight}>
        <Pressable onPress={goToNotifications} style={{ marginRight: 18 }}>
          <Image
            source={require("../assets/iconos/bell3.png")}
            style={{ width: 22, height: 22, tintColor: "#F3B23F" }}
          />
        </Pressable>

        {isWeb && (
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

  // Cabecera del administrador
  const renderAdminTopBar = () => (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        <View
          style={[
            styles.avatarCircle,
            { backgroundColor: "#0094A2", position: "relative" },
          ]}
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
          <Text style={styles.topBarRole}>Admin.</Text>
          <Text style={styles.topBarName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.topBarRight}>
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
  );

  // Menu lateral web y por rol
  const renderWebMenu = () => {
    if (!menuVisible || !isWeb) return null;

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

  // UI
  return (
    <View style={styles.pageContainer}>
      <Header hideAuthButtons />

      {/**Cabecera según el rol */}
      {role === "user" && renderUserTopBar()}
      {role === "organizer" && renderOrganizerTopBar()}
      {role === "admin" && renderAdminTopBar()}

      {/* Menú web */}
      {renderWebMenu()}

      {/* Menú móvil nativo */}
      {Platform.OS !== "web" &&
        menuVisible &&
        (role === "organizer" ? (
          <OrganizerMenu onClose={toggleMenu} />
        ) : role === "user" ? (
          <UserMenu onClose={toggleMenu} />
        ) : null)}

      {/* Scroll principal */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isMobileWeb ? 20 : 55,
          paddingTop: 5,
          paddingBottom: isLargeWeb ? 40 : 20,
        }}
        showsVerticalScrollIndicator
        nestedScrollEnabled
      >
        <Text style={styles.title}>Cultura e Historia</Text>

        {/* Texto ajustado para móviles */}
        <Text
          style={[
            styles.paragraph,
            isMobileSmall
              ? { fontSize: 13, lineHeight: 18 }
              : isMobileLarge
              ? { fontSize: 14, lineHeight: 20 }
              : {},
          ]}
        >
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
            !isWeb && styles.eventContainerMobile,
            eventContainerResponsiveStyle,
            {
              marginTop: isMobileSmall
                ? -20
                : isMobileLarge
                ? -10
                : isTabletWeb
                ? 20
                : isLaptopWeb
                ? 20
                : isLargeWeb
                ? 20
                : -10,
            },
          ]}
        >
          {isWeb ? (
            <ScrollView
              style={
                eventScrollMaxHeight
                  ? { maxHeight: eventScrollMaxHeight }
                  : undefined
              }
              showsVerticalScrollIndicator
            >
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

      {/* Footer */}
      {isWeb && showFooter && (
        <View style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
          <Footer
            onAboutPress={goToAbout}
            onPrivacyPress={goToPrivacy}
            onConditionsPress={goToConditions}
          />
        </View>
      )}
    </View>
  );
}

/*Lista de los eventos */

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
  {
    title: "Cabalgata de Reyes Magos",
    image: require("../assets/cabalgatas.jpg"),
    description:
      "Cada 5 de enero, El Cuervo celebra su tradicional Cabalgata de Reyes Magos, en la que Melchor, Gaspar y Baltasar recorren las calles del municipio lanzando caramelos y regalos a los niños. Carrozas decoradas por asociaciones locales, música, animación y un ambiente familiar convierten este desfile en uno de los días más especiales del año.",
  },
  {
    title: "Encendido del Alumbrado y Mercadillo de Navidad",
    image: require("../assets/alumbrado_navidad.jpg"),
    description:
      "El encendido del alumbrado navideño marca el inicio de la Navidad en El Cuervo. Se acompaña de un mercadillo con artesanía local, actividades infantiles, actuaciones musicales y visitas de personajes navideños. Es un evento esperado que reúne a familias y asociaciones del municipio.",
  },
  {
    title: "Verano Cultural – Noches al Fresquito",
    image: require("../assets/cine.jpg"),
    description:
      "Durante los meses de verano, el Ayuntamiento organiza el programa 'Verano Cultural', que incluye noches de cine al aire libre, conciertos, teatro, actividades infantiles y espectáculos. Estas veladas, celebradas en plazas y espacios abiertos, fomentan la convivencia y el ocio para todas las edades.",
  },
  {
    title: "Concurso de Saetas",
    image: require("../assets/saetas.jpg"),
    description:
      "En la época de Cuaresma, El Cuervo acoge el Concurso de Saetas, un certamen donde saeteros locales y de municipios cercanos interpretan este canto tradicional lleno de emoción y devoción. Es un evento cultural muy significativo que realza la importancia del flamenco religioso en la localidad.",
  },
  {
    title: "Día de Andalucía",
    image: require("../assets/andalucia.jpg"),
    description:
      "El 28 de febrero, El Cuervo celebra el Día de Andalucía con actos institucionales, actuaciones de música y danza, actividades escolares, degustaciones populares y convivencia ciudadana. Es una jornada festiva en la que se pone en valor la identidad andaluza y la participación comunitaria.",
  },
];

/* Estilos */
const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },

  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarCircle: {
    marginRight: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  topBarRole: {
    color: "#014869",
    fontWeight: "700",
    fontSize: 14,
  },

  topBarName: {
    color: "#6c757d",
    fontSize: 13,
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
    width: "100%",
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
