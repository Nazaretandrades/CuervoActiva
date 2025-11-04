// frontend/src/screens/CulturaHistoria.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";
import Header from "../components/HeaderIntro";
import Footer from "../components/Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CulturaHistoria({ navigation }) {
  const [role, setRole] = useState("user");

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
      } catch (err) {
        console.error("Error cargando sesión:", err);
      }
    };
    loadSession();
  }, []);

  // === ADMIN SOLO EN WEB ===
  if (role === "admin" && Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Header hideAuthButtons />
        <View style={styles.center}>
          <Text style={styles.deniedText}>
            Acceso denegado. Esta sección solo está disponible en web para administradores.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header hideAuthButtons />

      {/* === CONTENIDO SCROLLEABLE === */}
      <View
        style={[
          styles.contentWrapper,
          Platform.OS !== "web" && { maxHeight: "100%" },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* === TÍTULO === */}
          <Text style={styles.title}>Cultura e Historia</Text>

          {/* === PARRAFO HISTÓRICO === */}
          <Text style={styles.paragraph}>
            El Cuervo de Sevilla, situado en la comarca del Bajo Guadalquivir en
            Andalucía, fue parte de Lebrija hasta finales del siglo XX. Su independencia
            como municipio se alcanzó el 19 de diciembre de 1992 tras un movimiento popular
            que buscaba una gestión propia.{"\n\n"}
            Sus orígenes modernos se remontan al siglo XVIII, gracias a su ubicación junto
            a la antigua calzada romana Vía Augusta —hoy la carretera N-4—, donde existía una
            Casa de Postas que servía de punto de descanso entre Cádiz y Sevilla.
          </Text>

          {/* === EVENTOS === */}
          {events.map((evt, i) => (
            <View key={i} style={styles.eventCard}>
              <View style={styles.eventRow}>
                <Image source={{ uri: evt.image }} style={styles.eventImage} />
                <View style={styles.eventTextContainer}>
                  <Text style={styles.eventTitle}>{evt.title}</Text>
                  <Text style={styles.eventText}>{evt.description}</Text>
                </View>
              </View>

              {i < events.length - 1 && <View style={styles.separator} />}
            </View>
          ))}

          {/* Footer SOLO en móvil al final del scroll */}
          {Platform.OS !== "web" && (
            <View style={{ marginTop: 40, marginBottom: 20 }}>
              <Text
                style={{
                  textAlign: "center",
                  color: "#666",
                  fontSize: 12,
                }}
              >
                © 2025 CuervoActiva, Inc.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Footer solo visible en WEB */}
      {Platform.OS === "web" && <Footer />}
    </View>
  );
}

// === DATOS DE EVENTOS ===
const events = [
  {
    title: "Feria y Fiestas Patronales de El Cuervo de Sevilla",
    image:
      "https://www.elcuervodesevilla.es/export/sites/elcuervo/.content/imagenes/feria-elcuervo.jpg",
    description:
      "La Feria y Fiestas Patronales se celebran en honor a la Virgen del Rosario, patrona del municipio. Se realizan durante la primera semana de octubre y son consideradas la última feria de la provincia de Sevilla. Incluyen procesión religiosa, casetas, música y actividades populares que reflejan el espíritu vecinal de El Cuervo.",
  },
  {
    title: "Cabalgata de Reyes Magos de El Cuervo de Sevilla",
    image:
      "https://www.elcuervodesevilla.es/export/sites/elcuervo/.content/imagenes/cabalgata-reyes-elcuervo.jpg",
    description:
      "Cada 5 de enero las calles de El Cuervo se llenan de ilusión con la Cabalgata de Reyes Magos. Carrozas, música y reparto de caramelos hacen disfrutar a niños y familias, mientras Sus Majestades recorren los barrios repartiendo magia y alegría.",
  },
  {
    title: "Semana Santa de El Cuervo de Sevilla",
    image:
      "https://www.elcuervodesevilla.es/export/sites/elcuervo/.content/imagenes/semana-santa-elcuervo.jpg",
    description:
      "La Semana Santa de El Cuervo se caracteriza por su recogimiento y participación popular. Las hermandades y cofradías salen en procesión mostrando pasos y nazarenos que evocan la Pasión de Cristo, acompañados por bandas y devotos.",
  },
  {
    title: "Romería de El Cuervo de Sevilla",
    image:
      "https://www.elcuervodesevilla.es/export/sites/elcuervo/.content/imagenes/romeria-elcuervo.jpg",
    description:
      "La Romería se celebra a finales de mayo en honor a la Virgen del Rosario. Vecinos y peregrinos acompañan a la imagen hasta el parque Rocío de la Cámara, donde se disfruta de una jornada de convivencia con carrozas, caballos y cante andaluz.",
  },
  {
    title: "Día del Pan de El Cuervo de Sevilla",
    image:
      "https://www.elcuervodesevilla.es/export/sites/elcuervo/.content/imagenes/dia-del-pan-elcuervo.jpg",
    description:
      "El Día del Pan es una de las fiestas más singulares del pueblo. Nació para promocionar la industria panadera local y reúne degustaciones, exhibiciones artesanas y actividades para todas las edades. Su éxito ha convertido esta jornada en referente gastronómico de la zona.",
  },
  {
    title: "Corpus Christi de El Cuervo de Sevilla",
    image:
      "https://www.elcuervodesevilla.es/export/sites/elcuervo/.content/imagenes/corpus-elcuervo.jpg",
    description:
      "El Corpus Christi mantiene viva la tradición religiosa con una procesión en la que participan niños de Primera Comunión, hermandades y vecinos que decoran las calles con altares y flores.",
  },
  {
    title: "Día de Andalucía en El Cuervo de Sevilla",
    image:
      "https://www.elcuervodesevilla.es/export/sites/elcuervo/.content/imagenes/dia-andalucia-elcuervo.jpg",
    description:
      "El 28 de febrero se celebra el Día de Andalucía con actos institucionales, música flamenca y degustaciones de productos típicos. Se realizan actividades educativas para transmitir el orgullo de la identidad andaluza a los más jóvenes.",
  },
  {
    title: "Carnaval de El Cuervo de Sevilla",
    image:
      "https://www.elcuervodesevilla.es/export/sites/elcuervo/.content/imagenes/carnaval-elcuervo.jpg",
    description:
      "El Carnaval nació a finales de los años ochenta, impulsado por los colegios del municipio. Hoy es una gran fiesta popular con concursos de agrupaciones, pasacalles y disfraces que llenan de color las calles de El Cuervo.",
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentWrapper: {
    flex: 1,
    maxHeight: Dimensions.get("window").height - 160, // espacio para header/footer en web
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#014869",
    marginBottom: 20,
    textAlign: "center",
  },
  paragraph: {
    fontSize: 16,
    color: "#333",
    marginBottom: 30,
    textAlign: "justify",
    lineHeight: 24,
    maxWidth: 900,
  },
  eventCard: {
    width: "100%",
    maxWidth: 1000,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 20,
    marginBottom: 30,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 20,
  },
  eventImage: {
    width: 180,
    height: 140,
    borderRadius: 8,
  },
  eventTextContainer: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#014869",
    marginBottom: 6,
  },
  eventText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    textAlign: "justify",
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginTop: 15,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  deniedText: {
    fontSize: 18,
    color: "#d00",
    textAlign: "center",
  },
});
