@echo off
REM Stop All R-MAN E-Commerce Microservices

echo ============================================
echo   R-MAN E-Commerce Platform
echo   Stopping All Microservices
echo ============================================
echo.

setlocal EnableDelayedExpansion

REM Function to kill process on a specific port
:KILL_PORT
set PORT=%1
set SERVICE_NAME=%2
set PID=

echo [INFO] Stopping %SERVICE_NAME% on port %PORT%...

REM Find the PID using the port (get only the first match)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
    if not defined PID (
        set PID=%%a
    )
)

REM Check if a process was found
if defined PID (
    echo [INFO] Found process PID: !PID!
    taskkill /F /PID !PID! >nul 2>&1
    if !errorlevel! equ 0 (
        echo [SUCCESS] %SERVICE_NAME% stopped successfully
    ) else (
        echo [ERROR] Could not stop process !PID! - Try running as Administrator
    )
) else (
    echo [INFO] No process found running on port %PORT%
)
echo.
goto :eof

REM Stop CMPS (Port 5004)
echo [1/4] Stopping CMPS - Complaint Management Service (Port 5004)...
call :KILL_PORT 5004 "CMPS"

REM Stop ORMS (Port 5003)
echo [2/4] Stopping ORMS - Order Management Service (Port 5003)...
call :KILL_PORT 5003 "ORMS"

REM Stop CRMS (Port 5002)
echo [3/4] Stopping CRMS - Customer Management Service (Port 5002)...
call :KILL_PORT 5002 "CRMS"

REM Stop ATHS (Port 5001)
echo [4/4] Stopping ATHS - Authentication Service (Port 5001)...
call :KILL_PORT 5001 "ATHS"

echo ============================================
echo   All Services Stopped!
echo ============================================
echo.
echo   Press any key to exit...
pause >nul
