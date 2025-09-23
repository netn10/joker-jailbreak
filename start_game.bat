@echo off
echo Starting Joker Jailbreak Game...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Starting backend server...
start "Backend Server" cmd /k "cd backend && python uvicorn_app.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo Testing backend API...
python -c "import requests; import time; time.sleep(2); print('Testing backend...'); r = requests.get('http://localhost:8000/healthz'); print('Backend status:', r.json() if r.status_code == 200 else 'ERROR:', r.status_code)" 2>nul
if errorlevel 1 (
    echo WARNING: Backend test failed - server may still be starting
) else (
    echo Backend is running successfully!
)

echo.
echo Testing frontend...
python -c "import requests; r = requests.get('http://localhost:5173'); print('Frontend status:', 'OK' if r.status_code == 200 else 'ERROR:', r.status_code)" 2>nul
if errorlevel 1 (
    echo WARNING: Frontend test failed - server may still be starting
) else (
    echo Frontend is running successfully!
)

echo.
echo ========================================
echo Game servers are starting!
echo.
echo Backend API: http://localhost:8000
echo Frontend App: http://localhost:5173
echo.
echo Open your browser to http://localhost:5173 to play!
echo.
echo Press any key to close this window...
pause >nul
