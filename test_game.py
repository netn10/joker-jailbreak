#!/usr/bin/env python3
"""
Joker Jailbreak Game Test Script
Tests both backend and frontend functionality
"""

import requests
import time
import sys
import json


def test_backend():
    """Test backend API endpoints"""
    print("🔧 Testing Backend API...")

    base_url = "http://localhost:8000"

    try:
        # Test health endpoint
        print("  - Testing health endpoint...")
        response = requests.get(f"{base_url}/healthz", timeout=5)
        if response.status_code == 200:
            print(f"    ✅ Health check: {response.json()}")
        else:
            print(f"    ❌ Health check failed: {response.status_code}")
            return False

        # Test new game endpoint
        print("  - Testing new game endpoint...")
        response = requests.post(f"{base_url}/api/new-game", timeout=5)
        if response.status_code == 200:
            game_data = response.json()
            game_id = game_data.get("game_id")
            print(f"    ✅ New game created: {game_id}")

            # Test get state endpoint
            print("  - Testing get state endpoint...")
            state_response = requests.get(f"{base_url}/api/state/{game_id}", timeout=5)
            if state_response.status_code == 200:
                state = state_response.json()
                print(
                    f"    ✅ Game state retrieved: {len(state.get('walls', {}))} walls, {state.get('remainder', 0)} remainder"
                )

                # Test draw card endpoint
                print("  - Testing draw card endpoint...")
                draw_response = requests.post(
                    f"{base_url}/api/draw", json={"game_id": game_id}, timeout=5
                )
                if draw_response.status_code == 200:
                    print("    ✅ Draw card successful")
                else:
                    print(f"    ⚠️  Draw card failed: {draw_response.status_code}")

                # Test undo endpoint
                print("  - Testing undo endpoint...")
                undo_response = requests.post(
                    f"{base_url}/api/undo", json={"game_id": game_id}, timeout=5
                )
                if undo_response.status_code == 200:
                    print("    ✅ Undo successful")
                else:
                    print(f"    ⚠️  Undo failed: {undo_response.status_code}")

                return True
            else:
                print(f"    ❌ Get state failed: {state_response.status_code}")
                return False
        else:
            print(f"    ❌ New game failed: {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print("    ❌ Backend server not running on localhost:8000")
        return False
    except Exception as e:
        print(f"    ❌ Backend test error: {e}")
        return False


def test_frontend():
    """Test frontend server"""
    print("🎨 Testing Frontend Server...")

    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("    ✅ Frontend server is running")
            return True
        else:
            print(f"    ❌ Frontend server error: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("    ❌ Frontend server not running on localhost:5173")
        return False
    except Exception as e:
        print(f"    ❌ Frontend test error: {e}")
        return False


def main():
    """Main test function"""
    print("🎮 Joker Jailbreak Game Test")
    print("=" * 40)

    # Wait a moment for servers to start
    print("⏳ Waiting for servers to start...")
    time.sleep(3)

    backend_ok = test_backend()
    print()
    frontend_ok = test_frontend()

    print()
    print("=" * 40)
    print("📊 Test Results:")
    print(f"  Backend:  {'✅ PASS' if backend_ok else '❌ FAIL'}")
    print(f"  Frontend: {'✅ PASS' if frontend_ok else '❌ FAIL'}")

    if backend_ok and frontend_ok:
        print()
        print("🎉 All tests passed! Game is ready to play!")
        print("🌐 Open your browser to: http://localhost:5173")
        return 0
    else:
        print()
        print("⚠️  Some tests failed. Check the servers are running:")
        print("   Backend:  cd backend && python uvicorn_app.py")
        print("   Frontend: cd frontend && npm run dev")
        return 1


if __name__ == "__main__":
    sys.exit(main())
