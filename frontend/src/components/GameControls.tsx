import type { GameState } from '../types/GameState'

interface GameControlsProps {
  gameState: GameState | null
  onDraw: () => void
  onUndo: () => void
  onNewGame: () => void
  loading: boolean
}

export function GameControls({ gameState, onDraw, onUndo, onNewGame, loading }: GameControlsProps) {
  if (!gameState) return null

  const canDraw = gameState.remainder > 0 && gameState.joker_stack.length < 3 && !gameState.game_over
  const canUndo = !gameState.game_over

  return (
    <div className="game-controls">
      <button
        onClick={onDraw}
        disabled={!canDraw || loading}
        className="control-button draw-button"
      >
        Draw Card ({gameState.remainder} left)
      </button>
      
      <button
        onClick={onUndo}
        disabled={!canUndo || loading}
        className="control-button undo-button"
      >
        Undo
      </button>
      
      <button
        onClick={onNewGame}
        disabled={loading}
        className="control-button new-game-button"
      >
        New Game
      </button>
    </div>
  )
}
