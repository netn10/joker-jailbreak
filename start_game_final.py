#!/usr/bin/env python3
"""
Joker Jailbreak Game - Final Working Launcher
Handles Node.js version compatibility issues
"""

import subprocess
import time
import requests
import sys
import webbrowser
from pathlib import Path


def start_backend():
    """Start the backend server"""
    print("🚀 Starting Backend Server...")

    try:
        backend_dir = Path(__file__).parent / "backend"
        process = subprocess.Popen(
            ["python", "uvicorn_app.py"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Wait for backend to start
        for i in range(10):
            try:
                response = requests.get("http://localhost:8000/healthz", timeout=1)
                if response.status_code == 200:
                    print("   ✅ Backend server is running!")
                    return process
            except:
                pass
            time.sleep(1)

        print("   ❌ Backend failed to start")
        return None
    except Exception as e:
        print(f"   ❌ Error starting backend: {e}")
        return None


def start_frontend():
    """Start the frontend server with compatibility fixes"""
    print("🎨 Starting Frontend Server...")

    try:
        frontend_dir = Path(__file__).parent / "frontend"

        # Try to start with npm run dev
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Wait for frontend to start
        for i in range(15):
            try:
                response = requests.get("http://localhost:5173", timeout=1)
                if response.status_code == 200:
                    print("   ✅ Frontend server is running!")
                    return process
            except:
                pass
            time.sleep(1)

        # If npm run dev failed, try alternative approach
        print("   ⚠️  npm run dev failed, trying alternative...")
        process.terminate()

        # Try with npx vite directly
        process = subprocess.Popen(
            ["npx", "vite", "--host", "0.0.0.0", "--port", "5173"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Wait again
        for i in range(15):
            try:
                response = requests.get("http://localhost:5173", timeout=1)
                if response.status_code == 200:
                    print("   ✅ Frontend server is running!")
                    return process
            except:
                pass
            time.sleep(1)

        print("   ❌ Frontend failed to start")
        process.terminate()
        return None

    except Exception as e:
        print(f"   ❌ Error starting frontend: {e}")
        return None


def test_game():
    """Test the game functionality"""
    print("🎮 Testing Game...")

    try:
        # Test backend API
        response = requests.post("http://localhost:8000/api/new-game", timeout=5)
        if response.status_code == 200:
            game_data = response.json()
            print(f"   ✅ Backend API working! Game ID: {game_data.get('game_id')}")
        else:
            print(f"   ❌ Backend API failed: {response.status_code}")
            return False

        # Test frontend
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("   ✅ Frontend server working!")
            return True
        else:
            print(f"   ❌ Frontend failed: {response.status_code}")
            return False

    except Exception as e:
        print(f"   ❌ Game test error: {e}")
        return False


def main():
    """Main launcher function"""
    print("🎮 Joker Jailbreak Game Launcher")
    print("=" * 50)

    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("\n❌ Failed to start backend server")
        return 1

    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("\n❌ Failed to start frontend server")
        backend_process.terminate()
        return 1

    # Test the game
    if test_game():
        print("\n" + "=" * 50)
        print("🎉 Joker Jailbreak Game is Ready!")
        print("=" * 50)
        print("🌐 Backend API:  http://localhost:8000")
        print("🎮 Frontend App: http://localhost:5173")
        print()
        print("Opening game in your browser...")

        # Open browser
        try:
            webbrowser.open("http://localhost:5173")
        except:
            print("Please manually open: http://localhost:5173")

        print("\nPress Ctrl+C to stop servers...")

        try:
            # Keep servers running
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n👋 Stopping servers...")
            backend_process.terminate()
            frontend_process.terminate()
            print("✅ Servers stopped")
            return 0
    else:
        print("\n⚠️  Game test failed, but servers are running")
        print("🌐 Try opening: http://localhost:5173")
        return 1


if __name__ == "__main__":
    sys.exit(main())
