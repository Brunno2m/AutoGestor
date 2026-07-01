import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importe suas telas aqui (vamos criá-las no próximo passo)
import DashboardScreen from '../screens/DashboardScreen';
import NovoServicoScreen from '../screens/NovoServicoScreen';
import MapaResgatesScreen from '../screens/MapaResgatesScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// 1. Criamos as Tabs
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#d4a95f',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarStyle: {
          height: 68,
          paddingTop: 8,
          paddingBottom: 10,
          borderTopWidth: 0,
          backgroundColor: '#ffffff',
          elevation: 16,
          shadowColor: '#0f172a',
          shadowOpacity: 0.08,
          shadowRadius: 18,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Dashboard'
              ? 'grid-outline'
              : route.name === 'Novo Serviço'
                ? 'add-circle-outline'
                : 'map-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Novo Serviço" component={NovoServicoScreen} options={{ title: 'Novo' }} />
      <Tab.Screen name="Mapa" component={MapaResgatesScreen} />
    </Tab.Navigator>
  );
}

// 2. Colocamos as Tabs dentro do Drawer
export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Início"
        screenOptions={({ route }) => ({
          headerShown: false,
          drawerActiveTintColor: '#d4a95f',
          drawerInactiveTintColor: '#475569',
          drawerLabelStyle: {
            fontSize: 15,
            fontWeight: '700',
          },
          drawerStyle: {
            backgroundColor: '#f8fafc',
            width: 280,
          },
          sceneContainerStyle: {
            backgroundColor: '#e2e8f0',
          },
          drawerIcon: ({ color, size }) => {
            const iconName =
              route.name === 'Início'
                ? 'home-outline'
                : 'settings-outline';

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Drawer.Screen name="Início" component={HomeTabs} />
        <Drawer.Screen name="Configurações" component={ConfiguracoesScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}