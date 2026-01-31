import { MD3LightTheme, configureFonts } from 'react-native-paper';

// TradeEase Brand Colors (extracted from logo)
const tradeEaseColors = {
  // Primary Colors (Dark Navy from logo hexagon)
  primary: '#1B4B66',
  onPrimary: '#FFFFFF',
  primaryContainer: '#E3F2FD',
  onPrimaryContainer: '#0D47A1',

  // Secondary Colors (Light Blue from logo accent)
  secondary: '#37A0D4',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#B3E5FC',
  onSecondaryContainer: '#01579B',

  // Tertiary Colors
  tertiary: '#2E7BA6',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#E1F5FE',
  onTertiaryContainer: '#006064',

  // Surface Colors
  surface: '#FFFFFF',
  onSurface: '#1C1B1F',
  surfaceVariant: '#F5F5F5',
  onSurfaceVariant: '#49454F',

  // Background
  background: '#FAFAFA',
  onBackground: '#1C1B1F',

  // Error Colors
  error: '#F44336',
  onError: '#FFFFFF',
  errorContainer: '#FFEBEE',
  onErrorContainer: '#C62828',

  // Success Colors (Custom)
  success: '#4CAF50',
  onSuccess: '#FFFFFF',
  successContainer: '#E8F5E8',
  onSuccessContainer: '#1B5E20',

  // Warning Colors (Custom)
  warning: '#FF9800',
  onWarning: '#FFFFFF',
  warningContainer: '#FFF3E0',
  onWarningContainer: '#E65100',

  // Additional Surface Colors
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

// Typography Configuration
const fontConfig = {
  web: {
    regular: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
      fontWeight: '100',
    },
  },
  ios: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
  android: {
    regular: {
      fontFamily: 'Roboto',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'Roboto',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'Roboto',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'Roboto',
      fontWeight: '100',
    },
  },
};

export const tradeEaseTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...tradeEaseColors,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12, // Consistent with Material Design 3
};

// Status colors for badges and indicators
export const statusColors = {
  active: tradeEaseColors.success,
  inactive: '#9E9E9E',
  suspended: tradeEaseColors.error,
  pending: tradeEaseColors.warning,
  processing: tradeEaseColors.tertiary,
  completed: tradeEaseColors.success,
  cancelled: tradeEaseColors.error,
  high: tradeEaseColors.error,
  medium: tradeEaseColors.warning,
  low: tradeEaseColors.success,
  critical: '#D32F2F',
};

// Common spacing values
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Shadow configuration
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};