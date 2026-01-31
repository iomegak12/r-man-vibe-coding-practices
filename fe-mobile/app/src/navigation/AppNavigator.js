import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Context
import { useAuth } from '../contexts/AuthContext';

// Navigation Components
import AuthNavigator from './AuthNavigator';
import WelcomeNavigator from './WelcomeNavigator';
import DrawerContent from './DrawerContent';

// Screen Stacks
import DashboardNavigator from './DashboardNavigator';
import CustomerNavigator from './CustomerNavigator';
import OrderNavigator from './OrderNavigator';
import ComplaintNavigator from './ComplaintNavigator';
import ProfileNavigator from './ProfileNavigator';
import SettingsNavigator from './SettingsNavigator';

// Screens
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator for authenticated users
const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1B4B66', // TradeEase primary color
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardNavigator}
        options={{
          title: 'Dashboard',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Customers"
        component={CustomerNavigator}
        options={{
          title: 'Customers',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Orders"
        component={OrderNavigator}
        options={{
          title: 'Orders',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="package-variant" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Complaints"
        component={ComplaintNavigator}
        options={{
          title: 'Complaints',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alert-circle" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          title: 'Profile',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />

      <Drawer.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isLoading, isAuthenticated, hasSeenWelcome } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Authenticated user sees the main app
        <Stack.Screen name="Main" component={DrawerNavigator} />
      ) : hasSeenWelcome ? (
        // User has seen welcome screens, go to auth
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // New user sees welcome screens first
        <Stack.Screen name="Welcome" component={WelcomeNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;