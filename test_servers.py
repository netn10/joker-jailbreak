#!/usr/bin/env python3
"""
Simple server test script for Joker Jailbreak
"""

import requests
import time
import sys


def test_servers():
    """Test if both servers are running"""
    print("🔍 Testing Joker Jailbreak Servers...")
    print("=" * 40)

    # Test backend
    print("Testing Backend (localhost:8000)...")
    try:
        response = requests.get("http://localhost:8000/healthz", timeout=3)
        if response.status_code == 200:
            print("✅ Backend is running!")

            # Test game API
            game_response = requests.post(
                "http://localhost:8000/api/new-game", timeout=3
            )
            if game_response.status_code == 200:
                game_data = game_response.json()
                print(
                    f"✅ Game API working! Created game: {game_data.get('game_id', 'unknown')}"
                )
            else:
                print(f"⚠️  Game API issue: {game_response.status_code}")
        else:
            print(f"❌ Backend error: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print(
            "❌ Backend not running - start with: cd backend && python uvicorn_app.py"
        )
    except Exception as e:
        print(f"❌ Backend error: {e}")

    print()

    # Test frontend
    print("Testing Frontend (localhost:5173)...")
    try:
        response = requests.get("http://localhost:5173", timeout=3)
        if response.status_code == 200:
            print("✅ Frontend is running!")
        else:
            print(f"❌ Frontend error: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Frontend not running - start with: cd frontend && npm run dev")
    except Exception as e:
        print(f"❌ Frontend error: {e}")

    print()
    print("=" * 40)
    print("🌐 If both servers are running, open: http://localhost:5173")


if __name__ == "__main__":
    test_servers()
