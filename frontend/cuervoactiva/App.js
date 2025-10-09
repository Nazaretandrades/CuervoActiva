import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import Intro from "./screens/Intro";
import Register from "./screens/Register";
import Login from "./screens/Login"; // 👈 Importamos la nueva pantalla de login

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Intro">
        {/* Pantalla de inicio */}
        <Stack.Screen
          name="Intro"
          component={Intro}
          options={{ headerShown: false }}
        />

        {/* Pantalla de registro */}
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />

        {/* Pantalla de inicio de sesión */}
        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
