@echo off
REM Start ATHS (Authentication Service) - Port 5001

echo ============================================
echo   ATHS - Authentication Service
echo   Port: 5001
echo ============================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [WARNING] node_modules not found!
    echo [INFO] Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo [WARNING] .env file not found!
    echo [INFO] Please create .env file from .env.example
    echo.
    pause
    exit /b 1
)

REM Start the service
echo [INFO] Starting ATHS on port 5001...
echo.
npm start
