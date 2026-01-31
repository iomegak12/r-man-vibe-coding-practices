import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';

// Navigation
import AppNavigator from '@navigation/AppNavigator';

// Context Providers
import { AuthProvider } from '@contexts/AuthContext';
import { ThemeProvider, useThemeContext } from '@contexts/ThemeContext';

const AppContent = () => {
  const { theme, isDarkMode } = useThemeContext();

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar 
            style={isDarkMode ? "light" : "light"} 
            backgroundColor={theme.colors.primary} 
          />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}