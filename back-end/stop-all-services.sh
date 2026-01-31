#!/bin/bash

# Stop All R-MAN E-Commerce Microservices

echo "============================================"
echo "  R-MAN E-Commerce Platform"
echo "  Stopping All Microservices"
echo "============================================"
echo ""

# Function to kill process on a specific port
kill_port() {
    local PORT=$1
    local SERVICE_NAME=$2
    
    echo "[INFO] Stopping $SERVICE_NAME on port $PORT..."
    
    # Find and kill the process using the port
    if command -v lsof > /dev/null 2>&1; then
        # Using lsof (most common on Linux/macOS)
        PID=$(lsof -ti:$PORT 2>/dev/null)
    elif command -v fuser > /dev/null 2>&1; then
        # Using fuser (alternative)
        PID=$(fuser $PORT/tcp 2>/dev/null | awk '{print $1}')
    else
        echo "[ERROR] Neither lsof nor fuser command found. Cannot stop services."
        return 1
    fi
    
    if [ -z "$PID" ]; then
        echo "[INFO] No process found running on port $PORT"
    else
        echo "[INFO] Found process PID: $PID"
        kill -15 $PID 2>/dev/null
        
        # Wait a moment for graceful shutdown
        sleep 2
        
        # Check if process is still running, force kill if necessary
        if ps -p $PID > /dev/null 2>&1; then
            echo "[WARNING] Process still running, forcing stop..."
            kill -9 $PID 2>/dev/null
        fi
        
        if ps -p $PID > /dev/null 2>&1; then
            echo "[ERROR] Could not stop process $PID"
        else
            echo "[SUCCESS] $SERVICE_NAME stopped successfully"
        fi
    fi
    echo ""
}

# Stop services in reverse order (CMPS -> ORMS -> CRMS -> ATHS)
echo "[1/4] Stopping CMPS - Complaint Management Service (Port 5004)..."
kill_port 5004 "CMPS"

echo "[2/4] Stopping ORMS - Order Management Service (Port 5003)..."
kill_port 5003 "ORMS"

echo "[3/4] Stopping CRMS - Customer Management Service (Port 5002)..."
kill_port 5002 "CRMS"

echo "[4/4] Stopping ATHS - Authentication Service (Port 5001)..."
kill_port 5001 "ATHS"

echo "============================================"
echo "  All Services Stopped!"
echo "============================================"
echo ""
