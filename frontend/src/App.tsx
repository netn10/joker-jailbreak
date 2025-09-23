import { useState, useEffect } from 'react'
import { GameBoard } from './components/GameBoard'
import { GameControls } from './components/GameControls'
import { GameStatus } from './components/GameStatus'
import { ThemeToggle } from './components/ThemeToggle'
import { HintDisplay } from './components/HintDisplay'
import { GameService } from './services/GameService'
import type { GameState } from './types/GameState'
import type { PossibleMatch } from './services/HintService'
import './App.css'

function App() {
  const [gameId, setGameId] = useState<string | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightedMatches, setHighlightedMatches] = useState<PossibleMatch[]>([])
  const gameService = new GameService()

  const startNewGame = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await gameService.createGame()
      setGameId(response.game_id)
      setGameState(response.state)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start new game')
    } finally {
      setLoading(false)
    }
  }

  const refreshGameState = async () => {
    if (!gameId) return
    try {
      const state = await gameService.getGameState(gameId)
      setGameState(state)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh game state')
    }
  }

  const handleGameAction = async (action: () => Promise<void>) => {
    setLoading(true)
    setError(null)
    try {
      await action()
      await refreshGameState()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (gameId) {
      refreshGameState()
    }
  }, [gameId])

  return (
    <div className="app">
      <ThemeToggle />
      <HintDisplay 
        gameState={gameState} 
        onHighlightMatches={setHighlightedMatches}
        onSelectMove={(cardIds) => handleGameAction(() => gameService.makeMatch(gameId, cardIds))}
      />
      <header className="app-header">
        <h1>Joker Jailbreak</h1>
        <p>Clear one wall to free the Joker!</p>
      </header>
      
      <main className="app-main">
        {!gameId ? (
          <div className="start-screen">
            <button 
              onClick={startNewGame} 
              disabled={loading}
              className="start-button"
            >
              {loading ? 'Starting...' : 'Start New Game'}
            </button>
          </div>
        ) : (
          <>
            <GameStatus gameState={gameState} />
            <GameBoard 
              gameState={gameState} 
              highlightedMatches={highlightedMatches}
              onCardSelect={(cardIds) => handleGameAction(() => gameService.makeMatch(gameId, cardIds))}
            />
            <GameControls 
              gameState={gameState}
              onDraw={() => handleGameAction(() => gameService.drawCard(gameId))}
              onUndo={() => handleGameAction(() => gameService.undo(gameId))}
              onNewGame={startNewGame}
              loading={loading}
            />
          </>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
