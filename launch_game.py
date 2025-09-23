#!/usr/bin/env python3
"""
Joker Jailbreak Game Launcher
Comprehensive script to start and test the game
"""

import subprocess
import time
import requests
import sys
import os
import webbrowser
from pathlib import Path


def check_requirements():
    """Check if required tools are installed"""
    print("🔍 Checking requirements...")

    # Check Python
    try:
        result = subprocess.run(["python", "--version"], capture_output=True, text=True)
        print(f"✅ Python: {result.stdout.strip()}")
    except:
        print("❌ Python not found")
        return False

    # Check Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        print(f"✅ Node.js: {result.stdout.strip()}")
    except:
        print("❌ Node.js not found")
        return False

    # Check npm
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        print(f"✅ npm: {result.stdout.strip()}")
    except:
        print("❌ npm not found")
        return False

    return True


def start_backend():
    """Start the backend server"""
    print("\n🚀 Starting Backend Server...")

    try:
        # Start backend in a new process
        backend_dir = Path(__file__).parent / "backend"
        process = subprocess.Popen(
            ["python", "uvicorn_app.py"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Wait for backend to start
        print("   Waiting for backend to start...")
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
        process.terminate()
        return None

    except Exception as e:
        print(f"   ❌ Error starting backend: {e}")
        return None


def start_frontend():
    """Start the frontend server"""
    print("\n🎨 Starting Frontend Server...")

    try:
        # Start frontend in a new process
        frontend_dir = Path(__file__).parent / "frontend"
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Wait for frontend to start
        print("   Waiting for frontend to start...")
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


def test_game_api():
    """Test the game API functionality"""
    print("\n🎮 Testing Game API...")

    try:
        # Test new game
        response = requests.post("http://localhost:8000/api/new-game", timeout=5)
        if response.status_code == 200:
            game_data = response.json()
            game_id = game_data.get("game_id")
            print(f"   ✅ New game created: {game_id}")

            # Test get state
            state_response = requests.get(
                f"http://localhost:8000/api/state/{game_id}", timeout=5
            )
            if state_response.status_code == 200:
                state = state_response.json()
                print(
                    f"   ✅ Game state: {len(state.get('walls', {}))} walls, {state.get('remainder', 0)} remainder"
                )
                return True
            else:
                print(f"   ❌ Get state failed: {state_response.status_code}")
                return False
        else:
            print(f"   ❌ New game failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Game API test error: {e}")
        return False


def main():
    """Main launcher function"""
    print("🎮 Joker Jailbreak Game Launcher")
    print("=" * 50)

    # Check requirements
    if not check_requirements():
        print("\n❌ Missing requirements. Please install Python and Node.js")
        return 1

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

    # Test game API
    if not test_game_api():
        print("\n⚠️  Game API test failed, but servers are running")

    # Success!
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


if __name__ == "__main__":
    sys.exit(main())
