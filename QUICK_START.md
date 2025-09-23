# 🎮 Joker Jailbreak - Quick Start Guide

## 🚀 **Easiest Way to Run the Game**

### **Option 1: One-Command Launcher (Recommended)**
```bash
python start_game_final.py
```
This script will:
- ✅ Start the backend server
- ✅ Start the frontend server (with Node.js compatibility fixes)
- ✅ Test both servers
- ✅ Open the game in your browser
- ✅ Keep servers running until you press Ctrl+C

### **Option 2: Manual Startup**
If the launcher doesn't work, start servers manually:

**Terminal 1 (Backend):**
```bash
cd backend
python uvicorn_app.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Then open: http://localhost:5173

## 🧪 **Test Scripts**

**Check if servers are running:**
```bash
python test_servers.py
```

**Test game API:**
```bash
python test_game.py
```

## 🎯 **How to Play**

1. **Goal**: Clear one of the four walls to free the Joker
2. **Matching**: Click red and black cards with equal values
3. **Special Rule**: Draw up to 3 cards to joker stack when stuck
4. **Win**: Clear any wall completely

## 🔧 **Troubleshooting**

**Node.js Version Issue:**
- The game uses Vite 4.5.3 (compatible with Node.js 20.9.0)
- If you get Vite errors, the launcher script handles this automatically

**Backend Not Starting:**
- Make sure you're in the project root directory
- Check that Python virtual environment is activated

**Frontend Not Starting:**
- Try: `cd frontend && npx vite --host 0.0.0.0 --port 5173`
- Or use the launcher script which handles this automatically

## 📁 **Project Structure**
```
joker-jailbreak/
├── backend/          # FastAPI server (port 8000)
├── frontend/         # React app (port 5173)
├── start_game_final.py  # Main launcher
├── test_servers.py   # Test script
└── README.md         # Full documentation
```

## 🎉 **Ready to Play!**

The game is fully functional with:
- ✅ Complete Joker Jailbreak rules implementation
- ✅ Interactive card selection and matching
- ✅ Draw cards to joker stack when stuck
- ✅ Undo functionality
- ✅ Win detection
- ✅ Responsive design

**Just run: `python start_game_final.py` and start playing!** 🃏
