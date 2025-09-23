@echo off
title Joker Jailbreak Game
color 0A

echo.
echo ========================================
echo    JOKER JAILBREAK GAME LAUNCHER
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "backend\uvicorn_app.py" (
    echo ERROR: Backend files not found!
    echo Please run this script from the joker-jailbreak directory
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ERROR: Frontend files not found!
    echo Please run this script from the joker-jailbreak directory
    pause
    exit /b 1
)

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python uvicorn_app.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Waiting for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo    SERVERS STARTED!
echo ========================================
echo.
echo Backend API:  http://localhost:8000
echo Frontend App: http://localhost:5173
echo.
echo Open your browser to http://localhost:5173 to play!
echo.
echo Press any key to close this launcher...
pause >nul
