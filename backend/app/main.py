from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List

from .state import serialize_state
from .service import GameService


app = FastAPI(title="Joker Jailbreak API", version="0.1.0")

# Allow local dev frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class NewGameResponse(BaseModel):
    game_id: str
    state: Dict


class MatchRequest(BaseModel):
    game_id: str
    card_ids: List[str]


class DrawRequest(BaseModel):
    game_id: str


class UndoRequest(BaseModel):
    game_id: str


service = GameService()


@app.post("/api/new-game", response_model=NewGameResponse)
def new_game() -> NewGameResponse:
    game_id, state = service.create_game()
    return NewGameResponse(game_id=game_id, state=serialize_state(state))


@app.get("/api/state/{game_id}")
def get_state(game_id: str) -> Dict:
    state = service.get_game(game_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Game not found")
    return serialize_state(state)


@app.post("/api/match")
def make_match(req: MatchRequest) -> Dict:
    try:
        state = service.make_match(req.game_id, req.card_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return serialize_state(state)


@app.post("/api/draw")
def draw_card(req: DrawRequest) -> Dict:
    try:
        state = service.draw_card(req.game_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return serialize_state(state)


@app.post("/api/undo")
def undo(req: UndoRequest) -> Dict:
    try:
        state = service.undo(req.game_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return serialize_state(state)


@app.get("/healthz")
def health() -> Dict[str, str]:
    return {"status": "ok"}
