# Run Integration Tests
# This script runs all integration tests and generates an HTML report

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "R-MAN E-Commerce Integration Tests" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path "venv")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "   Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Check service health BEFORE activating venv (to avoid environment interference)
Write-Host ""
Write-Host "🏥 Checking service health..." -ForegroundColor Yellow

$services = @(
    @{Name="ATHS"; URL="http://localhost:5001/health"},
    @{Name="CRMS"; URL="http://localhost:5002/health"},
    @{Name="ORMS"; URL="http://localhost:5003/health"},
    @{Name="CMPS"; URL="http://localhost:5004/health"}
)

$allHealthy = $true
foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $($service.Name) is healthy" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $($service.Name) returned status: $($response.StatusCode)" -ForegroundColor Yellow
            $allHealthy = $false
        }
    } catch {
        Write-Host "   ❌ $($service.Name) is not running" -ForegroundColor Red
        $allHealthy = $false
    }
}

# Activate virtual environment
Write-Host ""
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Check if dependencies are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
$pipList = pip list
if ($pipList -notmatch "pytest") {
    Write-Host "   Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

if (-not $allHealthy) {
    Write-Host ""
    Write-Host "⚠️  WARNING: Some services are not healthy!" -ForegroundColor Yellow
    Write-Host "   Tests may fail. Do you want to continue? (Y/N)" -ForegroundColor Yellow
    $continue = Read-Host
    if ($continue -ne "Y" -and $continue -ne "y") {
        Write-Host "❌ Test execution cancelled" -ForegroundColor Red
        exit 1
    }
}

# Run tests
Write-Host ""
Write-Host "🧪 Running integration tests..." -ForegroundColor Cyan
Write-Host ""

# Create reports directory if it doesn't exist
if (-not (Test-Path "reports")) {
    New-Item -ItemType Directory -Path "reports" | Out-Null
}

# Run pytest with HTML report
pytest --verbose --html=reports/integration-test-report.html --self-contained-html

# Check test result
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Report: reports\integration-test-report.html" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "❌ Some tests failed!" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "📊 Report: reports\integration-test-report.html" -ForegroundColor Cyan
    Write-Host "   Check the report for details" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
