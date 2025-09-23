from __future__ import annotations

import random
import uuid
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from .models import Card, Suit, RANKS, Stack


WALL_SLOTS = ["N", "S", "E", "W"]
CORNER_SLOTS = ["NW", "NE", "SW", "SE"]


@dataclass
class GameState:
    seed: int
    deck: List[Card]
    remainder: List[Card]
    walls: Dict[str, Stack]
    corners: Dict[str, Stack]
    joker_stack: List[Card]
    history: List[Tuple[str, List[Card]]] = field(default_factory=list)
    game_over: bool = False
    won: bool = False
    lost: bool = False


def new_deck(seed: Optional[int] = None) -> List[Card]:
    rng = random.Random(seed)
    cards: List[Card] = []
    for suit in [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES]:
        for rank in RANKS:
            cid = f"{suit.value}-{rank}-{uuid.uuid4().hex[:6]}"
            cards.append(Card(id=cid, suit=suit, rank=rank))
    rng.shuffle(cards)
    return cards


def setup_game(seed: Optional[int] = None) -> GameState:
    deck = new_deck(seed)
    # Build walls: 6 cards each per N/S/E/W; last is face-up
    walls: Dict[str, Stack] = {}
    for slot in WALL_SLOTS:
        stack_cards = [deck.pop() for _ in range(6)]
        walls[slot] = Stack(cards=stack_cards)
    # Build corners: 2 cards each; last is face-up
    corners: Dict[str, Stack] = {}
    for slot in CORNER_SLOTS:
        stack_cards = [deck.pop() for _ in range(2)]
        corners[slot] = Stack(cards=stack_cards)
    # Remainder
    remainder = deck
    return GameState(
        seed=seed or random.randrange(1_000_000_000),
        deck=[],
        remainder=remainder,
        walls=walls,
        corners=corners,
        joker_stack=[],
    )


def visible_cards(state: GameState) -> Dict[str, Card]:
    visible: Dict[str, Card] = {}
    for slot, stack in state.walls.items():
        if stack.top():
            visible[f"W:{slot}"] = stack.top()
    for slot, stack in state.corners.items():
        if stack.top():
            visible[f"C:{slot}"] = stack.top()
    for idx, c in enumerate(state.joker_stack):
        visible[f"J:{idx}"] = c
    return visible


def serialize_card(c: Card) -> Dict:
    return {
        "id": c.id,
        "suit": c.suit.value,
        "rank": c.rank,
        "value": c.value,
        "color": "red" if c.is_red else "black",
    }


def serialize_state(state: GameState) -> Dict:
    return {
        "seed": state.seed,
        "walls": {
            k: [serialize_card(c) for c in v.cards] for k, v in state.walls.items()
        },
        "corners": {
            k: [serialize_card(c) for c in v.cards] for k, v in state.corners.items()
        },
        "joker_stack": [serialize_card(c) for c in state.joker_stack],
        "remainder": len(state.remainder),
        "game_over": state.game_over,
        "won": state.won,
        "lost": state.lost,
    }
