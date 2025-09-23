import type { GameState } from '../types/GameState'

interface GameStatusProps {
  gameState: GameState | null
}

export function GameStatus({ gameState }: GameStatusProps) {
  if (!gameState) return null

  return (
    <div className="game-status">
      <div className="status-info">
        <span>Remainder: {gameState.remainder}</span>
        <span>Joker Stack: {gameState.joker_stack.length}/3</span>
      </div>
      
      {gameState.game_over && (
        <div className={`game-result ${gameState.won ? 'won' : 'lost'}`}>
          {gameState.won ? '🎉 Joker Escaped! You Win!' : '💀 Game Over - No moves left'}
        </div>
      )}
    </div>
  )
}
