#!/usr/bin/env python3
"""
Joker Jailbreak Game Runner
Starts both backend and frontend servers and tests them
"""

import subprocess
import time
import requests
import sys
import threading
import os
from pathlib import Path


class GameRunner:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.project_root = Path(__file__).parent

    def start_backend(self):
        """Start the backend server"""
        print("🚀 Starting Backend Server...")
        backend_dir = self.project_root / "backend"

        try:
            self.backend_process = subprocess.Popen(
                ["python", "uvicorn_app.py"],
                cwd=backend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            print("   ✅ Backend server started")
            return True
        except Exception as e:
            print(f"   ❌ Failed to start backend: {e}")
            return False

    def start_frontend(self):
        """Start the frontend server"""
        print("🎨 Starting Frontend Server...")
        frontend_dir = self.project_root / "frontend"

        try:
            self.frontend_process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            print("   ✅ Frontend server started")
            return True
        except Exception as e:
            print(f"   ❌ Failed to start frontend: {e}")
            return False

    def test_backend(self):
        """Test if backend is working"""
        print("🔧 Testing Backend API...")

        for attempt in range(10):  # Try for 10 seconds
            try:
                response = requests.get("http://localhost:8000/healthz", timeout=2)
                if response.status_code == 200:
                    print("   ✅ Backend API is responding")
                    return True
            except:
                pass
            time.sleep(1)

        print("   ❌ Backend API not responding")
        return False

    def test_frontend(self):
        """Test if frontend is working"""
        print("🎨 Testing Frontend Server...")

        for attempt in range(10):  # Try for 10 seconds
            try:
                response = requests.get("http://localhost:5173", timeout=2)
                if response.status_code == 200:
                    print("   ✅ Frontend server is responding")
                    return True
            except:
                pass
            time.sleep(1)

        print("   ❌ Frontend server not responding")
        return False

    def test_game_api(self):
        """Test the game API functionality"""
        print("🎮 Testing Game API...")

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

    def cleanup(self):
        """Clean up processes"""
        print("\n🧹 Cleaning up...")
        if self.backend_process:
            self.backend_process.terminate()
            print("   ✅ Backend server stopped")
        if self.frontend_process:
            self.frontend_process.terminate()
            print("   ✅ Frontend server stopped")

    def run(self):
        """Main run function"""
        print("🎮 Joker Jailbreak Game Runner")
        print("=" * 50)

        try:
            # Start servers
            backend_ok = self.start_backend()
            time.sleep(2)  # Give backend time to start

            frontend_ok = self.start_frontend()
            time.sleep(3)  # Give frontend time to start

            if not backend_ok or not frontend_ok:
                print("\n❌ Failed to start servers")
                return False

            # Test servers
            print("\n🔍 Testing servers...")
            backend_test = self.test_backend()
            frontend_test = self.test_frontend()

            if backend_test and frontend_test:
                # Test game API
                game_test = self.test_game_api()

                print("\n" + "=" * 50)
                print("📊 Test Results:")
                print(f"  Backend:  {'✅ PASS' if backend_test else '❌ FAIL'}")
                print(f"  Frontend: {'✅ PASS' if frontend_test else '❌ FAIL'}")
                print(f"  Game API: {'✅ PASS' if game_test else '❌ FAIL'}")

                if backend_test and frontend_test and game_test:
                    print("\n🎉 All systems working! Game is ready!")
                    print("🌐 Open your browser to: http://localhost:5173")
                    print("\nPress Ctrl+C to stop servers...")

                    # Keep servers running
                    try:
                        while True:
                            time.sleep(1)
                    except KeyboardInterrupt:
                        print("\n👋 Stopping servers...")
                        return True
                else:
                    print("\n⚠️  Some tests failed")
                    return False
            else:
                print("\n❌ Server tests failed")
                return False

        except KeyboardInterrupt:
            print("\n👋 Interrupted by user")
            return True
        except Exception as e:
            print(f"\n❌ Error: {e}")
            return False
        finally:
            self.cleanup()


def main():
    """Main function"""
    runner = GameRunner()
    success = runner.run()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
