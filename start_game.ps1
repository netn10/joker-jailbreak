# Joker Jailbreak Game Startup Script
Write-Host "Starting Joker Jailbreak Game..." -ForegroundColor Green
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>&1
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python uvicorn_app.py" -WindowStyle Normal

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

# Wait for frontend to start
Write-Host "Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "Testing backend API..." -ForegroundColor Cyan
try {
    $backendTest = python -c "import requests; import time; time.sleep(2); print('Testing backend...'); r = requests.get('http://localhost:8000/healthz'); print('Backend status:', r.json() if r.status_code == 200 else 'ERROR:', r.status_code)" 2>&1
    Write-Host $backendTest -ForegroundColor Green
} catch {
    Write-Host "WARNING: Backend test failed - server may still be starting" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Testing frontend..." -ForegroundColor Cyan
try {
    $frontendTest = python -c "import requests; r = requests.get('http://localhost:5173'); print('Frontend status:', 'OK' if r.status_code == 200 else 'ERROR:', r.status_code)" 2>&1
    Write-Host $frontendTest -ForegroundColor Green
} catch {
    Write-Host "WARNING: Frontend test failed - server may still be starting" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Game servers are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Blue
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Blue
Write-Host ""
Write-Host "Open your browser to http://localhost:5173 to play!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
Read-Host
