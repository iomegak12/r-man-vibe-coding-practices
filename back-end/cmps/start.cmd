@echo off
REM Start CMPS (Complaint Management Service) - Port 5004

echo ============================================
echo   CMPS - Complaint Management Service
echo   Port: 5004
echo ============================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo [WARNING] Virtual environment not found!
    echo [INFO] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b 1
    )
    echo [SUCCESS] Virtual environment created
    echo.
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment!
    pause
    exit /b 1
)

REM Check if dependencies are installed
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo [WARNING] Dependencies not installed!
    echo [INFO] Installing dependencies...
    pip install -r requirements.txt
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
echo [INFO] Starting CMPS on port 5004...
echo.
python -m uvicorn app.main:app --host 0.0.0.0 --port 5004 --reload
