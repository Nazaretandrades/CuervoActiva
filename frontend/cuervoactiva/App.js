// APP.JS
// 1) Importaciones necesarias
import React from "react";
import { NavigationContainer } from "@react-navigation/native"; // Contenedor principal de navegación
import { createStackNavigator } from "@react-navigation/stack"; // Sistema de navegación tipo "stack"

// 2) Importamos las pantallas principales
import Intro from "./screens/Intro"; // Pantalla de presentación / portada
import Register from "./screens/Register"; // Pantalla de registro de usuario
import Login from "./screens/Login"; // Pantalla de inicio de sesión
import Organizer from "./screens/Organizer";
import Admin from "./screens/Admin";
import User from "./screens/User";
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

// 3) Creamos el Stack Navigator
const Stack = createStackNavigator();

// 🟢 4) Configuración de linking (para que el navegador recuerde las rutas)
const linking = {
  prefixes: ["http://localhost:19006", "https://tusitio.com"],
  config: {
    screens: {
      Intro: "intro",
      Register: "register",
      Login: "login",
      Organizer: "organizer",
      Admin: "admin",
      User: "user",
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
    },
  },
};

// 5) Componente principal de la aplicación
export default function App() {
  return (
    // NavigationContainer: envuelve toda la app y gestiona el estado de la navegación
    <NavigationContainer linking={linking}>
      {/* 
        Stack.Navigator: define las pantallas disponibles
        y la forma en que se muestran (sin encabezado nativo)
      */}
      <Stack.Navigator initialRouteName="Intro">
        {/* Pantalla inicial — Intro */}
        <Stack.Screen
          name="Intro"
          component={Intro}
          options={{
            headerShown: false,
            title: "Introducción",
          }}
        />

        {/* Pantalla de registro */}
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false, title: "Registro" }}
        />

        {/* Pantalla de inicio de sesión */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false, title: "Inicio Sesión" }}
        />

        <Stack.Screen
          name="Organizer"
          component={Organizer}
          options={{ headerShown: false, title: "Home - Organizador" }}
        />

        <Stack.Screen
          name="Admin"
          component={Admin}
          options={{ headerShown: false, title: "Home - Administrador" }}
        />

        <Stack.Screen
          name="User"
          component={User}
          options={{ headerShown: false, title: "Home - Usuario" }}
        />

        <Stack.Screen
          name="UserEventDetail"
          component={UserEventDetail}
          options={{ headerShown: false, title: "Detalle Evento - Usuario" }}
        />

        <Stack.Screen
          name="OrganizerEventDetail"
          component={OrganizerEventDetail}
          options={{
            headerShown: false,
            title: "Detalle Evento - Organizador",
          }}
        />

        <Stack.Screen
          name="AdminEventDetail"
          component={AdminEventDetail}
          options={{
            headerShown: false,
            title: "Detalle Evento - Administrador",
          }}
        />

        <Stack.Screen
          name="OrganizerNotifications"
          component={OrganizerNotifications}
          options={{
            headerShown: false,
            title: "Notificaciones - Organizador",
          }}
        />

        <Stack.Screen
          name="AdminNotifications"
          component={AdminNotifications}
          options={{
            headerShown: false,
            title: "Notificaciones - Administrador",
          }}
        />

        <Stack.Screen
          name="UserNotifications"
          component={UserNotifications}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="UserFavorites"
          component={UserFavorites}
          options={{ headerShown: false, title: "Favoritos - Usuario" }}
        />

        <Stack.Screen
          name="AdminUsers"
          component={AdminUsers}
          options={{ headerShown: false, title: "Usuarios" }}
        />

        <Stack.Screen
          name="SobreNosotros"
          component={SobreNosotros}
          options={{ headerShown: false, title: "Sobre Nosotros" }}
        />

        <Stack.Screen
          name="UserProfile"
          component={UserProfile}
          options={{ headerShown: false, title: "Perfil - Usuario" }}
        />

        <Stack.Screen
          name="OrganizerProfile"
          component={OrganizerProfile}
          options={{ headerShown: false, title: "Perfil - Organizador" }}
        />

        <Stack.Screen
          name="AdminProfile"
          component={AdminProfile}
          options={{ headerShown: false, title: "Perfil - Administrador" }}
        />

        <Stack.Screen
          name="PoliticaPrivacidad"
          component={PoliticaPrivacidad}
          options={{ headerShown: false, title: "Política y Privacidad" }}
        />

        <Stack.Screen
          name="Condiciones"
          component={Condiciones}
          options={{ headerShown: false, title: "Condiciones" }}
        />

        <Stack.Screen
          name="Contacto"
          component={Contacto}
          options={{ headerShown: false, title: "Contacto" }}
        />

        <Stack.Screen
          name="CulturaHistoria"
          component={CulturaHistoria}
          options={{ headerShown: false, title: "Cultura e Historia" }}
        />

        <Stack.Screen
          name="Calendar"
          component={Calendar}
          options={{ headerShown: false, title: "Calendario" }}
        />

        <Stack.Screen
          name="OrganizerMenu"
          component={OrganizerMenu}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="UserMenu"
          component={UserMenu}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
