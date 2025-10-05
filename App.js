import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ===================================
// IMPORTAÇÃO DE TODAS AS TELAS
// ===================================
import LoginScreen from './app/screens/LoginScreen';
import CofreScreen from './app/screens/CofreScreen'; 
import ContatosScreen from './app/screens/ContatosScreen'; 
import CofreGalleryScreen from './app/screens/CofreGalleryScreen';
import ContatosCofreScreen from './app/screens/ContatosCofreScreen'; // <-- NOVO: Tela do Cofre de Contatos

// Cria o objeto que gerencia as telas
const Stack = createNativeStackNavigator();

function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      {/* 1. Tela de Login (Rota Inicial) */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
      
      {/* 2. Tela principal do Cofre (Após o Login) */}
      <Stack.Screen 
        name="Cofre" 
        component={CofreScreen} 
        options={{ title: 'AgendaSegura' }}
      />

      {/* 3. Tela de Seleção de Contatos */}
      <Stack.Screen 
        name="Contatos" // Nome usado para navegação
        component={ContatosScreen} 
        options={{ title: 'Adicionar Contato' }}
      />
      
      {/* 4. Tela de Visualização do Cofre (GALERIA DE MÍDIAS) */}
      <Stack.Screen 
        name="CofreGallery" // Nome usado para navegação
        component={CofreGalleryScreen} 
        options={{ title: 'Galeria Secreta' }}
      />

      {/* 5. TELA DE VISUALIZAÇÃO E RESTAURAÇÃO DE CONTATOS ESCONDIDOS */}
      <Stack.Screen 
        name="ContatosCofre" 
        component={ContatosCofreScreen} 
        options={{ title: 'Cofre de Contatos' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <AppStack />
    </NavigationContainer>
  );
}
