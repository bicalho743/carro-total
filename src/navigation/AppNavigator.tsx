import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import CarroScreen from '../screens/CarroScreen';
import FinanciamentoScreen from '../screens/FinanciamentoScreen';
import MensalScreen from '../screens/MensalScreen';
import ResultadoScreen from '../screens/ResultadoScreen';
import ObraScreen from '../screens/ObraScreen';
import ViagemScreen from '../screens/ViagemScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const THEME = {
  primary: '#1a1a2e',
  accent: '#e94560',
  bg: '#f8f9fa',
  tabActive: '#1a1a2e',
  tabInactive: '#adb5bd',
};

function CarroStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: THEME.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="Veiculo"
        component={CarroScreen}
        options={{ title: 'Veículo' }}
      />
      <Stack.Screen
        name="Financiamento"
        component={FinanciamentoScreen}
        options={{ title: 'Financiamento' }}
      />
      <Stack.Screen
        name="Mensal"
        component={MensalScreen}
        options={{ title: 'Custos Mensais' }}
      />
      <Stack.Screen
        name="Resultado"
        component={ResultadoScreen}
        options={{ title: 'Resultado Total' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: THEME.tabActive,
          tabBarInactiveTintColor: THEME.tabInactive,
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0.5,
            borderTopColor: '#dee2e6',
            paddingBottom: 4,
            height: 58,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        }}
      >
        <Tab.Screen
          name="CarroTab"
          component={CarroStack}
          options={{
            title: 'Carro',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="car-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Obra"
          component={ObraScreen}
          options={{
            title: 'Obra',
            headerShown: true,
            headerStyle: { backgroundColor: THEME.primary },
            headerTintColor: '#fff',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="hammer-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Viagem"
          component={ViagemScreen}
          options={{
            title: 'Viagem',
            headerShown: true,
            headerStyle: { backgroundColor: THEME.primary },
            headerTintColor: '#fff',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="airplane-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
