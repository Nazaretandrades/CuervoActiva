//APP.JS
//1) Importaciones necesarias
import React from "react";
import { NavigationContainer } from "@react-navigation/native"; //Contenedor principal de navegación
import { createStackNavigator } from "@react-navigation/stack"; //Sistema de navegación tipo "stack"

//2) Importamos las pantallas principales
import Intro from "./screens/Intro"; //Pantalla de presentación / portada
import Register from "./screens/Register"; //Pantalla de registro de usuario
import Login from "./screens/Login"; //Pantalla de inicio de sesión
import Organizer from "./screens/Organizer";
import Admin from "./screens/Admin";
import User from "./screens/User";

//3) Creamos el Stack Navigator
//Este componente permite navegar entre pantallas de forma apilada
const Stack = createStackNavigator();

//4) Componente principal de la aplicación
export default function App() {
  return (
    //NavigationContainer: envuelve toda la app y gestiona el estado de la navegación
    <NavigationContainer>
      {/* 
        Stack.Navigator: define las pantallas disponibles
        y la forma en que se muestran (sin encabezado nativo)
      */}
      <Stack.Navigator initialRouteName="Intro">
        {/*Pantalla inicial — Intro */}
        <Stack.Screen
          name="Intro" //Nombre de la ruta
          component={Intro} //Componente asociado
          options={{ headerShown: false }} //Oculta la cabecera nativa
        />

        {/*Pantalla de registro */}
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }} //Oculta el encabezado por diseño personalizado
        />

        {/*Pantalla de inicio de sesión */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Organizer"
          component={Organizer}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Admin"
          component={Admin}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="User"
          component={User}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
