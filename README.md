# Joker Jailbreak

A digital implementation of the solo card game "Joker Jailbreak" by Ramon Huiskamp. Built with React (TypeScript) frontend and FastAPI (Python) backend.

## How to Play

The goal is to clear one of the four "walls" surrounding the Joker so the Joker can escape. You do this by matching black cards to red cards of the exact face value (or sum to exact value) to discard them, revealing more cards underneath.

### Game Rules

1. **Setup**: The game uses a standard 52-card deck with jokers removed. Cards are arranged in:
   - 4 wall stacks (North, South, East, West) with 6 cards each
   - 4 corner stacks (NW, NE, SW, SE) with 2 cards each
   - A remainder deck with the remaining cards

2. **Matching**: You can match:
   - Single red card vs single black card of same value
   - Multiple red cards vs multiple black cards where the sums are equal
   - Example: Red 4 + Red 2 = Black 6

3. **Special Rule**: If stuck, you can draw up to 3 cards from the remainder and place them on the Joker. These must also be cleared to win.

4. **Win Condition**: Clear any one of the four wall stacks completely.

## Setup and Installation

### Prerequisites

- Python 3.11+
- Node.js 20+
- npm

### Backend Setup

1. Navigate to the project root:
   ```bash
   cd joker-jailbreak
   ```

2. Activate the Python virtual environment:
   ```bash
   # Windows
   .\venv\Scripts\Activate.ps1
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. Install backend dependencies (already done):
   ```bash
   pip install fastapi uvicorn pydantic[dotenv] python-multipart pytest httpx
   ```

4. Run the backend server:
   ```bash
   cd backend
   python uvicorn_app.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies (already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## Running the Application

### 🚀 Quick Start (Recommended)

**Option 1: Use the launcher script**
```bash
python launch_game.py
```
This will start both servers, test them, and open the game in your browser.

**Option 2: Use the batch file (Windows)**
```bash
start_game_simple.bat
```

**Option 3: Manual startup**
1. **Start the backend** (Terminal 1):
   ```bash
   cd backend
   python uvicorn_app.py
   ```

2. **Start the frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser** to `http://localhost:5173`

### 🧪 Testing Scripts

**Test if servers are running:**
```bash
python test_servers.py
```

**Test game functionality:**
```bash
python test_game.py
```

## Testing

### Backend Tests

Run the backend tests:
```bash
cd backend
pytest -q
```

### Frontend Tests

The frontend tests have compatibility issues with the current jsdom version. The core functionality is implemented and tested manually.

## API Endpoints

- `POST /api/new-game` - Create a new game
- `GET /api/state/{game_id}` - Get current game state
- `POST /api/match` - Make a card match
- `POST /api/draw` - Draw a card to Joker stack
- `POST /api/undo` - Undo last action
- `GET /healthz` - Health check

## Game Features

- **Interactive Card Selection**: Click cards to select them for matching
- **Visual Feedback**: Selected cards are highlighted
- **Game Status**: Shows remainder count, joker stack size, and win/loss status
- **Action Controls**: Draw cards, undo moves, start new games
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
joker-jailbreak/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI app
│   │   ├── models.py        # Card and game models
│   │   ├── state.py         # Game state management
│   │   └── service.py       # Game logic service
│   ├── tests/
│   │   ├── conftest.py
│   │   └── test_game_logic.py
│   ├── uvicorn_app.py       # Server entry point
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API service layer
│   │   ├── types/          # TypeScript types
│   │   └── test/           # Test files
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Development

The application follows the Joker Jailbreak rules exactly as described. The backend implements the core game logic with proper validation, and the frontend provides an intuitive interface for playing the game.

### Key Implementation Details

- **Card Matching**: Validates that red and black card values sum to equal amounts
- **Game State**: Tracks walls, corners, joker stack, and remainder
- **Undo System**: Maintains history for undo functionality
- **Win Detection**: Automatically detects when a wall is cleared
- **Error Handling**: Comprehensive error handling for invalid moves

Enjoy playing Joker Jailbreak! 🃏
