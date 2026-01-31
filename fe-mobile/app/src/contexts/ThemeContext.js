import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// TradeEase Brand Colors for Light Theme
const tradeEaseLightColors = {
  primary: '#1B4B66',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E3F2FD',
  onPrimaryContainer: '#0D47A1',
  secondary: '#37A0D4',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#B3E5FC',
  onSecondaryContainer: '#01579B',
  tertiary: '#2E7BA6',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#E1F5FE',
  onTertiaryContainer: '#006064',
  surface: '#FFFFFF',
  onSurface: '#1C1B1F',
  surfaceVariant: '#F5F5F5',
  onSurfaceVariant: '#49454F',
  background: '#FAFAFA',
  onBackground: '#1C1B1F',
  error: '#F44336',
  onError: '#FFFFFF',
  errorContainer: '#FFEBEE',
  onErrorContainer: '#C62828',
  outline: '#79747E',
  outlineVariant: '#BDBDBD',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#90CAF9',
  elevation: {
    level0: 'transparent',
    level1: '#FFFFFF',
    level2: '#F8F9FA',
    level3: '#F1F3F4',
    level4: '#ECEFF1',
    level5: '#E8EAF6',
  },
};

// TradeEase Brand Colors for Dark Theme
const tradeEaseDarkColors = {
  primary: '#90CAF9',
  onPrimary: '#003258',
  primaryContainer: '#00497D',
  onPrimaryContainer: '#CFE5FF',
  secondary: '#B3E5FC',
  onSecondary: '#003544',
  secondaryContainer: '#004D61',
  onSecondaryContainer: '#C8E6F7',
  tertiary: '#81D4FA',
  onTertiary: '#003642',
  tertiaryContainer: '#00515E',
  onTertiaryContainer: '#B3E5FC',
  surface: '#1C1B1F',
  onSurface: '#E6E1E5',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  background: '#1C1B1F',
  onBackground: '#E6E1E5',
  error: '#F2B8B5',
  onError: '#601410',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',
  outline: '#938F99',
  outlineVariant: '#49454F',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#E6E1E5',
  inverseOnSurface: '#313033',
  inversePrimary: '#00497D',
  elevation: {
    level0: 'transparent',
    level1: '#232326',
    level2: '#282829',
    level3: '#2D2D30',
    level4: '#323235',
    level5: '#37373A',
  },
};

const lightTheme = {
  ...MD3LightTheme,
  colors: tradeEaseLightColors,
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: tradeEaseDarkColors,
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
    setIsLoading(false);
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme_preference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
