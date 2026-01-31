#!/bin/bash

# Start CMPS (Complaint Management Service) - Port 5004

echo "============================================"
echo "  CMPS - Complaint Management Service"
echo "  Port: 5004"
echo "============================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "[WARNING] Virtual environment not found!"
    echo "[INFO] Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to create virtual environment!"
        exit 1
    fi
    echo "[SUCCESS] Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "[INFO] Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to activate virtual environment!"
    exit 1
fi

# Check if dependencies are installed
python -c "import fastapi" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "[WARNING] Dependencies not installed!"
    echo "[INFO] Installing dependencies..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to install dependencies!"
        exit 1
    fi
    echo "[SUCCESS] Dependencies installed"
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "[WARNING] .env file not found!"
    echo "[INFO] Please create .env file from .env.example"
    echo ""
    exit 1
fi

# Start the service
echo "[INFO] Starting CMPS on port 5004..."
echo ""
python -m uvicorn app.main:app --host 0.0.0.0 --port 5004 --reload
