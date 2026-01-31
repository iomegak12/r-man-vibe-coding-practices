import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Auth screens (to be implemented in Phase 2)
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

// Constants
import { ROUTES } from '../constants';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Auth screens typically don't need headers
        gestureEnabled: false, // Disable swipe back for auth flows
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      
      <Stack.Screen 
        name={ROUTES.AUTH.FORGOT_PASSWORD} 
        component={ForgotPasswordScreen}
      />
      
      <Stack.Screen 
        name={ROUTES.AUTH.RESET_PASSWORD} 
        component={ResetPasswordScreen}
      />
      
      {/* Phase 2: Additional auth screens */}
      {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;