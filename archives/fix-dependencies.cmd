@echo off
REM Fix Python Dependencies for CRMS, ORMS, CMPS

echo ============================================
echo   Fixing Python Dependencies
echo   (motor + pymongo compatibility)
echo ============================================
echo.

echo [1/3] Fixing CRMS dependencies...
cd /d "%~dp0crms"
if exist "venv\" (
    call venv\Scripts\activate.bat
    pip install --upgrade pymongo==4.6.1 motor==3.3.2
    call deactivate
    echo [SUCCESS] CRMS dependencies fixed
) else (
    echo [SKIP] CRMS venv not found
)
echo.

echo [2/3] Fixing ORMS dependencies...
cd /d "%~dp0orms"
if exist "venv\" (
    call venv\Scripts\activate.bat
    pip install --upgrade pymongo==4.6.1 motor==3.3.2
    call deactivate
    echo [SUCCESS] ORMS dependencies fixed
) else (
    echo [SKIP] ORMS venv not found
)
echo.

echo [3/3] Fixing CMPS dependencies...
cd /d "%~dp0cmps"
if exist "venv\" (
    call venv\Scripts\activate.bat
    pip install --upgrade pymongo==4.6.1 motor==3.3.2
    call deactivate
    echo [SUCCESS] CMPS dependencies fixed
) else (
    echo [SKIP] CMPS venv not found
)
echo.

cd /d "%~dp0"

echo ============================================
echo   All dependencies fixed!
echo ============================================
echo.
echo   You can now run: start.cmd
echo.
pause
