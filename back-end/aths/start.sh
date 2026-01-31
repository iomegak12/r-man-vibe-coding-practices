#!/bin/bash

# Start ATHS (Authentication Service) - Port 5001

echo "============================================"
echo "  ATHS - Authentication Service"
echo "  Port: 5001"
echo "============================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[WARNING] node_modules not found!"
    echo "[INFO] Installing dependencies..."
    npm install
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
echo "[INFO] Starting ATHS on port 5001..."
echo ""
npm start
