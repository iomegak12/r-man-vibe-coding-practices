@echo off
echo Cleaning React Native project for Java 21...

echo.
echo 1. Cleaning Metro cache...
call npx react-native start --reset-cache --dry-run

echo.
echo 2. Cleaning Gradle cache...
cd android
call .\gradlew clean
cd ..

echo.
echo 3. Removing node_modules...
rmdir /s /q node_modules

echo.
echo 4. Removing package-lock.json...
del package-lock.json

echo.
echo 5. Installing dependencies...
call npm install

echo.
echo 6. Cleaning Expo cache...
call npx expo install --fix

echo.
echo Project cleaned! Now try running:
echo npx expo run:android