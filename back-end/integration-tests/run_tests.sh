#!/bin/bash

# Run Integration Tests
# This script runs all integration tests and generates an HTML report

echo "============================================"
echo "R-MAN E-Commerce Integration Tests"
echo "============================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "   Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if ! pip list | grep -q pytest; then
    echo "   Installing dependencies..."
    pip install -r requirements.txt
    echo "✅ Dependencies installed"
fi

# Check service health
echo ""
echo "🏥 Checking service health..."

check_service() {
    local name=$1
    local url=$2
    
    if curl -s -f -o /dev/null --max-time 2 "$url"; then
        echo "   ✅ $name is healthy"
        return 0
    else
        echo "   ❌ $name is not running"
        return 1
    fi
}

all_healthy=true
check_service "ATHS" "http://localhost:5001/health" || all_healthy=false
check_service "CRMS" "http://localhost:5002/health" || all_healthy=false
check_service "ORMS" "http://localhost:5003/health" || all_healthy=false
check_service "CMPS" "http://localhost:5004/health" || all_healthy=false

if [ "$all_healthy" = false ]; then
    echo ""
    echo "⚠️  WARNING: Some services are not healthy!"
    echo "   Tests may fail. Do you want to continue? (Y/N)"
    read -r continue
    if [ "$continue" != "Y" ] && [ "$continue" != "y" ]; then
        echo "❌ Test execution cancelled"
        exit 1
    fi
fi

# Run tests
echo ""
echo "🧪 Running integration tests..."
echo ""

# Create reports directory if it doesn't exist
mkdir -p reports

# Run pytest with HTML report
pytest --verbose --html=reports/integration-test-report.html --self-contained-html

# Check test result
if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "✅ All tests passed!"
    echo "============================================"
    echo ""
    echo "📊 Report: reports/integration-test-report.html"
else
    echo ""
    echo "============================================"
    echo "❌ Some tests failed!"
    echo "============================================"
    echo ""
    echo "📊 Report: reports/integration-test-report.html"
    echo "   Check the report for details"
fi

echo ""
