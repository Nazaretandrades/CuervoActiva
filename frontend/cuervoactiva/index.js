// PUNTO DE ENTRADA PRINCIPAL DE LA APP EXPO

//1) Importamos la función que registra el componente raíz en Expo
import { registerRootComponent } from "expo";

//2) Importamos el componente principal de la aplicación
import App from "../cuervoactiva/App";

//Registro del componente raíz
//La función registerRootComponent hace dos cosas principales:
//1. Llama internamente a:
//    AppRegistry.registerComponent('main', () => App);
//    Esto le dice a React Native cuál es el componente principal
//    que debe renderizar al iniciar la aplicación.
//
//2. Asegura que el entorno se configure correctamente tanto si:
//
//    Ejecutas la app en Expo Go
//    O haces una compilación nativa (Android/iOS)
//
//Es decir, esta línea garantiza que la aplicación se ejecute
//sin necesidad de cambiar nada entre desarrollo y producción.
registerRootComponent(App);
