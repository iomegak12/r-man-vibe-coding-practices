#!/bin/bash

# Start All R-MAN E-Commerce Microservices

echo "============================================"
echo "  R-MAN E-Commerce Platform"
echo "  Starting All Microservices"
echo "============================================"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check MongoDB
echo "[INFO] Checking MongoDB connection..."
sleep 1
echo ""

# Start ATHS (Port 5001)
echo "[1/4] Starting ATHS - Authentication Service (Port 5001)..."
cd "$SCRIPT_DIR/aths"
gnome-terminal --title="ATHS - Port 5001" -- bash -c "./start.sh; exec bash" 2>/dev/null || \
xterm -title "ATHS - Port 5001" -e "bash -c './start.sh; exec bash'" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR/aths"' && ./start.sh"' 2>/dev/null || \
(echo "[WARNING] Could not open new terminal. Running in background..." && ./start.sh &)
sleep 3

# Start CRMS (Port 5002)
echo "[2/4] Starting CRMS - Customer Management Service (Port 5002)..."
cd "$SCRIPT_DIR/crms"
gnome-terminal --title="CRMS - Port 5002" -- bash -c "./start.sh; exec bash" 2>/dev/null || \
xterm -title "CRMS - Port 5002" -e "bash -c './start.sh; exec bash'" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR/crms"' && ./start.sh"' 2>/dev/null || \
(echo "[WARNING] Could not open new terminal. Running in background..." && ./start.sh &)
sleep 3

# Start ORMS (Port 5003)
echo "[3/4] Starting ORMS - Order Management Service (Port 5003)..."
cd "$SCRIPT_DIR/orms"
gnome-terminal --title="ORMS - Port 5003" -- bash -c "./start.sh; exec bash" 2>/dev/null || \
xterm -title "ORMS - Port 5003" -e "bash -c './start.sh; exec bash'" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR/orms"' && ./start.sh"' 2>/dev/null || \
(echo "[WARNING] Could not open new terminal. Running in background..." && ./start.sh &)
sleep 3

# Start CMPS (Port 5004)
echo "[4/4] Starting CMPS - Complaint Management Service (Port 5004)..."
cd "$SCRIPT_DIR/cmps"
gnome-terminal --title="CMPS - Port 5004" -- bash -c "./start.sh; exec bash" 2>/dev/null || \
xterm -title "CMPS - Port 5004" -e "bash -c './start.sh; exec bash'" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$SCRIPT_DIR/cmps"' && ./start.sh"' 2>/dev/null || \
(echo "[WARNING] Could not open new terminal. Running in background..." && ./start.sh &)
sleep 3

cd "$SCRIPT_DIR"

echo ""
echo "============================================"
echo "  All Services Started!"
echo "============================================"
echo ""
echo "  ATHS: http://localhost:5001"
echo "  CRMS: http://localhost:5002"
echo "  ORMS: http://localhost:5003"
echo "  CMPS: http://localhost:5004"
echo ""
echo "  API Documentation:"
echo "  ATHS: http://localhost:5001/docs"
echo "  CRMS: http://localhost:5002/docs"
echo "  ORMS: http://localhost:5003/docs"
echo "  CMPS: http://localhost:5004/docs"
echo ""
echo "  Press Ctrl+C to exit..."
wait
