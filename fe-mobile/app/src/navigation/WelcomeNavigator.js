import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Welcome screens
import WelcomeIntroScreen from '../screens/welcome/WelcomeIntroScreen';
import WelcomeFeaturesScreen from '@screens/welcome/WelcomeFeaturesScreen';
import WelcomeDashboardScreen from '@screens/welcome/WelcomeDashboardScreen';

const Stack = createStackNavigator();

const WelcomeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Welcome screens typically don't need headers
        gestureEnabled: true, // Allow swipe back
      }}
    >
      <Stack.Screen 
        name="WelcomeIntro" 
        component={WelcomeIntroScreen}
      />
      
      <Stack.Screen 
        name="WelcomeFeatures" 
        component={WelcomeFeaturesScreen}
      />
      
      <Stack.Screen 
        name="WelcomeDashboard" 
        component={WelcomeDashboardScreen}
      />
    </Stack.Navigator>
  );
};

export default WelcomeNavigator;