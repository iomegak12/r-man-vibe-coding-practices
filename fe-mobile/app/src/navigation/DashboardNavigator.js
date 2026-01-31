import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Dashboard Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import AnalyticsScreen from '@screens/dashboard/AnalyticsScreen';

const Stack = createStackNavigator();

const DashboardNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1B4B66',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerTitle: 'TradeEase Dashboard',
        }}
      />
      <Stack.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: 'Analytics',
          headerTitle: 'Analytics & Reports',
        }}
      />
    </Stack.Navigator>
  );
};

export default DashboardNavigator;