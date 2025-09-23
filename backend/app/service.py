from __future__ import annotations

import uuid
from typing import Dict, List, Optional, Tuple

from .models import Card
from .state import GameState, setup_game, visible_cards, WALL_SLOTS


class GameService:
    def __init__(self) -> None:
        self._games: Dict[str, GameState] = {}

    def create_game(self) -> Tuple[str, GameState]:
        gid = uuid.uuid4().hex[:10]
        state = setup_game()
        self._games[gid] = state
        return gid, state

    def get_game(self, game_id: str) -> Optional[GameState]:
        return self._games.get(game_id)

    def _find_card_location(
        self, state: GameState, card_id: str
    ) -> Optional[Tuple[str, str]]:
        # Returns (scope, slot) where scope in {W, C, J}
        for slot, stack in state.walls.items():
            if stack.top() and stack.top().id == card_id:
                return ("W", slot)
        for slot, stack in state.corners.items():
            if stack.top() and stack.top().id == card_id:
                return ("C", slot)
        for idx, c in enumerate(state.joker_stack):
            if c.id == card_id:
                return ("J", str(idx))
        return None

    def _remove_top(self, state: GameState, scope: str, slot: str) -> Card:
        if scope == "W":
            return state.walls[slot].pop()
        if scope == "C":
            return state.corners[slot].pop()
        if scope == "J":
            idx = int(slot)
            return state.joker_stack.pop(idx)
        raise ValueError("Invalid card location")

    def _push_history(self, state: GameState, action: str, cards: List[Card]) -> None:
        state.history.append((action, cards))

    def make_match(self, game_id: str, card_ids: List[str]) -> GameState:
        state = self._require(game_id)
        if state.game_over:
            raise ValueError("Game over")
        if len(card_ids) < 2:
            raise ValueError("Need at least two cards to match")
        visible = visible_cards(state)
        selected = []
        for cid in card_ids:
            if cid not in [c.id for c in visible.values()]:
                raise ValueError("Card not visible")
            loc = self._find_card_location(state, cid)
            if not loc:
                raise ValueError("Card not found")
            selected.append(loc)
        # Fetch cards
        cards: List[Card] = []
        for scope, slot in selected:
            c = self._remove_top(state, scope, slot)
            cards.append(c)
        # Validate colors: must include at least one red and one black
        reds = [c for c in cards if c.is_red]
        blacks = [c for c in cards if c.is_black]
        if not reds or not blacks:
            # rollback
            self._undo_pop(state, cards)
            raise ValueError("Match must include red and black cards")
        # Validate equal rank value sum equivalence
        red_sum = sum(c.value for c in reds)
        black_sum = sum(c.value for c in blacks)
        if red_sum != black_sum:
            self._undo_pop(state, cards)
            raise ValueError("Red and black values must be equal")
        # success: discard (just keep them off stacks), record history for undo
        self._push_history(state, "match", cards)
        # Check win: any wall cleared entirely
        for slot in WALL_SLOTS:
            if len(state.walls[slot].cards) == 0:
                state.game_over = True
                state.won = True
                break
        # Check for loss condition after each move
        if not state.game_over:
            self._check_lose_condition(state)
        return state

    def _undo_pop(self, state: GameState, cards: List[Card]) -> None:
        # Put cards back on their original locations in reverse fetch order into visible positions.
        # For simplicity, restore to joker if the card was from joker, else to wall/corner top.
        for c in reversed(cards):
            # Prefer restoring to a wall/corner that still exposes the same color/value flow is complex; we keep it simple for undo within same call.
            # This function is only used for immediate rollback on failed validation, not user-facing undo.
            state.joker_stack.append(c)

    def draw_card(self, game_id: str) -> GameState:
        state = self._require(game_id)
        if state.game_over:
            raise ValueError("Game over")
        if len(state.joker_stack) >= 3:
            raise ValueError("Joker stack already has 3 cards")
        if not state.remainder:
            raise ValueError("No cards left in remainder")
        card = state.remainder.pop()
        state.joker_stack.append(card)
        self._push_history(state, "draw", [card])
        # Check for loss condition after drawing
        if not state.game_over:
            self._check_lose_condition(state)
        return state

    def undo(self, game_id: str) -> GameState:
        state = self._require(game_id)
        if not state.history:
            raise ValueError("Nothing to undo")
        action, cards = state.history.pop()
        if action == "draw":
            # remove from joker stack, return to remainder
            card = state.joker_stack.pop()
            state.remainder.append(card)
        elif action == "match":
            # Put matched cards back onto joker stack (simplified deterministic undo)
            for c in cards:
                state.joker_stack.append(c)
            state.game_over = False
            state.won = False
            state.lost = False
        else:
            raise ValueError("Unknown action")
        return state

    def _require(self, game_id: str) -> GameState:
        state = self._games.get(game_id)
        if state is None:
            raise ValueError("Game not found")
        return state

    def _check_lose_condition(self, state: GameState) -> None:
        """Check if the game should end in a loss due to no valid moves."""
        if not self._has_valid_moves(state):
            state.game_over = True
            state.lost = True

    def _has_valid_moves(self, state: GameState) -> bool:
        """Check if there are any valid moves available."""
        visible = visible_cards(state)
        visible_cards_list = list(visible.values())

        # Check if we can make any valid matches with current visible cards
        for i in range(len(visible_cards_list)):
            for j in range(i + 1, len(visible_cards_list)):
                card1 = visible_cards_list[i]
                card2 = visible_cards_list[j]

                # Check if we can match these two cards
                if self._can_match_cards([card1, card2]):
                    return True

        # Check if we can make matches with more than 2 cards
        # For simplicity, we'll check combinations of up to 3 cards
        for i in range(len(visible_cards_list)):
            for j in range(i + 1, len(visible_cards_list)):
                for k in range(j + 1, len(visible_cards_list)):
                    card1 = visible_cards_list[i]
                    card2 = visible_cards_list[j]
                    card3 = visible_cards_list[k]

                    if self._can_match_cards([card1, card2, card3]):
                        return True

        # If no valid moves with current cards, check if we can draw from remainder
        # and if that would help (i.e., if remainder has cards and we haven't reached joker stack limit)
        if state.remainder and len(state.joker_stack) < 3:
            return True  # Can still draw, so not lost yet

        return False

    def _can_match_cards(self, cards: List[Card]) -> bool:
        """Check if a set of cards can form a valid match."""
        if len(cards) < 2:
            return False

        # Must have at least one red and one black card
        reds = [c for c in cards if c.is_red]
        blacks = [c for c in cards if c.is_black]

        if not reds or not blacks:
            return False

        # Sum of red cards must equal sum of black cards
        red_sum = sum(c.value for c in reds)
        black_sum = sum(c.value for c in blacks)

        return red_sum == black_sum
