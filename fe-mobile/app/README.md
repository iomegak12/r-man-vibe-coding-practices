# TradeEase Mobile App

React Native mobile application for TradeEase administrators built with Expo Development Build and Material Design 3.

## Project Setup

### Prerequisites
- Node.js 18+ and npm 8+
- Android Studio (for Android development)
- Expo CLI: `npm install -g @expo/cli`
- Java 21 (for Android builds)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Run on Android:**
   ```bash
   npm run android
   ```

### Development Build

This project uses Expo Development Build for native module compatibility:

1. **Create development build:**
   ```bash
   npx expo install --fix
   npx expo run:android
   ```

2. **Install EAS CLI (for cloud builds):**
   ```bash
   npm install -g eas-cli
   ```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── common/        # Common components (buttons, inputs)
│   ├── forms/         # Form components
│   ├── charts/        # Chart and analytics components
│   └── modals/        # Modal dialogs
├── screens/           # Screen components
│   ├── auth/          # Authentication screens
│   ├── dashboard/     # Dashboard screens
│   ├── customers/     # Customer management screens
│   ├── orders/        # Order management screens
│   └── complaints/    # Complaint management screens
├── navigation/        # Navigation configuration
├── contexts/          # React Context providers
├── services/          # API services and utilities
├── utils/             # Utility functions and helpers
├── constants/         # App constants and configuration
└── assets/            # Images, fonts, and other assets
```

## Features

- **Material Design 3** with TradeEase branding
- **JWT Authentication** with automatic token refresh
- **Drawer + Stack Navigation** for admin interface
- **Customer Management** - view, edit, manage profiles
- **Order Management** - track, update, process orders
- **Complaint Management** - assign, resolve, track complaints
- **Dashboard Analytics** with business metrics
- **Responsive Design** optimized for mobile/tablet

## API Integration

Connects to existing TradeEase microservices:
- **ATHS** (Port 5001) - Authentication Service
- **CRMS** (Port 5002) - Customer Management Service  
- **ORMS** (Port 5003) - Order Management Service
- **CMPS** (Port 5004) - Complaint Management Service

## Development Phases

- **Phase 1**: ✅ Project Setup & Environment
- **Phase 2**: Authentication System
- **Phase 3**: Navigation Structure  
- **Phase 4**: Customer Management
- **Phase 5**: Order Management
- **Phase 6**: Complaint Management
- **Phase 7**: Dashboard & Analytics
- **Phase 8**: Testing & Deployment

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run build:android` - Build Android APK (requires EAS)

## Configuration

- **App Configuration**: `app.json`
- **Metro Bundler**: `metro.config.js`
- **Babel Config**: `babel.config.js`
- **Theme**: `src/constants/theme.js`
- **Constants**: `src/constants/index.js`