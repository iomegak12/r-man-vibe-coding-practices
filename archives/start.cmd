@echo off
REM Start All R-MAN E-Commerce Microservices

echo ============================================
echo   R-MAN E-Commerce Platform
echo   Starting All Microservices
echo ============================================
echo.

REM Check MongoDB
echo [INFO] Checking MongoDB connection...
timeout /t 1 /nobreak >nul
echo.

REM Start ATHS (Port 5001)
echo [1/4] Starting ATHS - Authentication Service (Port 5001)...
start "ATHS - Port 5001" cmd /k "cd /d %~dp0aths && start.cmd"
timeout /t 3 /nobreak >nul

REM Start CRMS (Port 5002)
echo [2/4] Starting CRMS - Customer Management Service (Port 5002)...
start "CRMS - Port 5002" cmd /k "cd /d %~dp0crms && start.cmd"
timeout /t 3 /nobreak >nul

REM Start ORMS (Port 5003)
echo [3/4] Starting ORMS - Order Management Service (Port 5003)...
start "ORMS - Port 5003" cmd /k "cd /d %~dp0orms && start.cmd"
timeout /t 3 /nobreak >nul

REM Start CMPS (Port 5004)
echo [4/4] Starting CMPS - Complaint Management Service (Port 5004)...
start "CMPS - Port 5004" cmd /k "cd /d %~dp0cmps && start.cmd"
timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo   All Services Started!
echo ============================================
echo.
echo   ATHS: http://localhost:5001
echo   CRMS: http://localhost:5002
echo   ORMS: http://localhost:5003
echo   CMPS: http://localhost:5004
echo.
echo   API Documentation:
echo   ATHS: http://localhost:5001/docs
echo   CRMS: http://localhost:5002/docs
echo   ORMS: http://localhost:5003/docs
echo   CMPS: http://localhost:5004/docs
echo.
echo   Press any key to exit...
pause >nul
