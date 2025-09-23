from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import List, Optional


class Suit(str, Enum):
    HEARTS = "H"
    DIAMONDS = "D"
    CLUBS = "C"
    SPADES = "S"


RED_SUITS = {Suit.HEARTS, Suit.DIAMONDS}
BLACK_SUITS = {Suit.CLUBS, Suit.SPADES}


RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]


def rank_value(rank: str) -> int:
    if rank == "A":
        return 1
    if rank == "J":
        return 11
    if rank == "Q":
        return 12
    if rank == "K":
        return 13
    return int(rank)


@dataclass(frozen=True)
class Card:
    id: str
    suit: Suit
    rank: str

    @property
    def is_red(self) -> bool:
        return self.suit in RED_SUITS

    @property
    def is_black(self) -> bool:
        return self.suit in BLACK_SUITS

    @property
    def value(self) -> int:
        return rank_value(self.rank)


@dataclass
class Stack:
    cards: List[Card]

    def top(self) -> Optional[Card]:
        return self.cards[-1] if self.cards else None

    def pop(self) -> Card:
        return self.cards.pop()

    def push(self, card: Card) -> None:
        self.cards.append(card)
