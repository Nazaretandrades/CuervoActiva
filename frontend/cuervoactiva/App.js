// Archivo principal de la app
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native"; // maneja toda la navegación
import { createStackNavigator } from "@react-navigation/stack"; // sistema de navegación tipo "pila"
import { ActivityIndicator, View, Platform } from "react-native";
// Imports de todas las pantallas
import Intro from "./screens/Intro";
import Login from "./screens/Login";
import Register from "./screens/Register";
import User from "./screens/User";
import Organizer from "./screens/Organizer";
import Admin from "./screens/Admin";
import UserEventDetail from "./screens/UserEventDetail";
import OrganizerEventDetail from "./screens/OrganizerEventDetail";
import AdminEventDetail from "./screens/AdminEventDetail";
import OrganizerNotifications from "./screens/OrganizerNotifications";
import AdminNotifications from "./screens/AdminNotifications";
import UserNotifications from "./screens/UserNotifications";
import UserFavorites from "./screens/UserFavorites";
import AdminUsers from "./screens/AdminUsers";
import SobreNosotros from "./screens/SobreNosotros";
import UserProfile from "./screens/UserProfile";
import OrganizerProfile from "./screens/OrganizerProfile";
import AdminProfile from "./screens/AdminProfile";
import PoliticaPrivacidad from "./screens/PoliticaPrivacidad";
import Condiciones from "./screens/Condiciones";
import Contacto from "./screens/Contacto";
import CulturaHistoria from "./screens/CulturaHistoria";
import Calendar from "./screens/Calendar";
import OrganizerMenu from "./screens/OrganizerMenu";
import UserMenu from "./screens/UserMenu";
import AddEvent from "./screens/AddEvent";
import EditEvent from "./screens/EditEvent";

// Defino la "pila" de pantallas en la que se navega
const Stack = createStackNavigator();

// Permite que en web puedas entrar directamente a una pantalla vía URL
const linking = {
  prefixes: [
    "http://localhost:19006",
    "http://localhost:5000",
    //"https://tusitio.com", PONER LA URL CUANDO ESTÉ DESPLEGADA
  ],
  config: {
    screens: {
      Intro: "intro",
      Login: "login",
      Register: "register",
      User: "user",
      Organizer: "organizer",
      Admin: "admin",
      UserEventDetail: "user-event/:eventId",
      OrganizerEventDetail: "organizer-event/:eventId",
      AdminEventDetail: "admin-event/:eventId",
      OrganizerNotifications: "organizer-notifications",
      AdminNotifications: "admin-notifications",
      UserNotifications: "user-notifications",
      UserFavorites: "user-favorites",
      AdminUsers: "admin-users",
      SobreNosotros: "sobre-nosotros",
      UserProfile: "user-profile",
      OrganizerProfile: "organizer-profile",
      AdminProfile: "admin-profile",
      PoliticaPrivacidad: "politica-privacidad",
      Condiciones: "condiciones",
      Contacto: "contacto",
      CulturaHistoria: "cultura-historia",
      Calendar: "calendar",
      OrganizerMenu: "organizer-menu",
      UserMenu: "user-menu",
      AddEvent: "add-event",
      EditEvent: "edit-event",
    },
  },
};

// Declaración del componente principal
export default function App() {
  // Estados
  const [initialRoute, setInitialRoute] = useState("Intro");
  const [loading, setLoading] = useState(Platform.OS === "web");

  // useEffect para comprobar sesión en Web
  useEffect(() => {
    if (Platform.OS === "web") {
      const checkSession = async () => {
        try {
          const session = JSON.parse(localStorage.getItem("USER_SESSION"));

          if (session?.role) {
            if (session.role === "user") setInitialRoute("User");
            else if (session.role === "organizer") setInitialRoute("Organizer");
            else if (session.role === "admin") setInitialRoute("Admin");
            else setInitialRoute("Intro");
          } else {
            setInitialRoute("Intro");
          }
        } catch (err) {
          console.error("Error verificando sesión:", err);
          setInitialRoute("Intro");
        } finally {
          setLoading(false);
        }
      };

      checkSession();
    } else {
      setInitialRoute("Intro");
    }
  }, []);

  // Loader mientras carga
  if (loading && Platform.OS === "web") {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#014869" />
      </View>
    );
  }

  return (
    /**
     * Aquí se monta:
     * El sistema de navegación.
     * Las rutas.
     * Y la pantalla inicial.
     */
    <NavigationContainer
      linking={linking}
      independent={true}
      fallback={<ActivityIndicator size="large" color="#014869" />}
    >
      {/**Declaración de todas las pantallas */}
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Intro" component={Intro} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="User" component={User} />
        <Stack.Screen name="Organizer" component={Organizer} />
        <Stack.Screen name="Admin" component={Admin} />
        <Stack.Screen name="UserEventDetail" component={UserEventDetail} />
        <Stack.Screen
          name="OrganizerEventDetail"
          component={OrganizerEventDetail}
        />
        <Stack.Screen name="AdminEventDetail" component={AdminEventDetail} />
        <Stack.Screen
          name="OrganizerNotifications"
          component={OrganizerNotifications}
        />
        <Stack.Screen
          name="AdminNotifications"
          component={AdminNotifications}
        />
        <Stack.Screen name="UserNotifications" component={UserNotifications} />
        <Stack.Screen name="UserFavorites" component={UserFavorites} />
        <Stack.Screen name="AdminUsers" component={AdminUsers} />
        <Stack.Screen name="SobreNosotros" component={SobreNosotros} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="OrganizerProfile" component={OrganizerProfile} />
        <Stack.Screen name="AdminProfile" component={AdminProfile} />
        <Stack.Screen
          name="PoliticaPrivacidad"
          component={PoliticaPrivacidad}
        />
        <Stack.Screen name="Condiciones" component={Condiciones} />
        <Stack.Screen name="Contacto" component={Contacto} />
        <Stack.Screen name="CulturaHistoria" component={CulturaHistoria} />
        <Stack.Screen name="Calendar" component={Calendar} />
        <Stack.Screen name="OrganizerMenu" component={OrganizerMenu} />
        <Stack.Screen name="UserMenu" component={UserMenu} />
        <Stack.Screen name="AddEvent" component={AddEvent} />
        <Stack.Screen name="EditEvent" component={EditEvent} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
