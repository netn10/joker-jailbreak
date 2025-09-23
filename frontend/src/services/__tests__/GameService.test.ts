import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GameService } from '../GameService'
import type { GameState, NewGameResponse } from '../../types/GameState'

// Mock fetch
global.fetch = vi.fn()

describe('GameService', () => {
  let gameService: GameService
  const mockGameState: GameState = {
    seed: 12345,
    walls: {},
    corners: {},
    joker_stack: [],
    remainder: 20,
    game_over: false,
    won: false
  }

  beforeEach(() => {
    gameService = new GameService()
    vi.clearAllMocks()
  })

  it('creates a new game', async () => {
    const mockResponse: NewGameResponse = {
      game_id: 'test-game-id',
      state: mockGameState
    }

    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await gameService.createGame()
    
    expect(result).toEqual(mockResponse)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/new-game',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })

  it('gets game state', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGameState)
    })

    const result = await gameService.getGameState('test-game-id')
    
    expect(result).toEqual(mockGameState)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/state/test-game-id',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })

  it('makes a match', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGameState)
    })

    const result = await gameService.makeMatch('test-game-id', ['card1', 'card2'])
    
    expect(result).toEqual(mockGameState)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/match',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          game_id: 'test-game-id',
          card_ids: ['card1', 'card2']
        })
      })
    )
  })

  it('draws a card', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGameState)
    })

    const result = await gameService.drawCard('test-game-id')
    
    expect(result).toEqual(mockGameState)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/draw',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ game_id: 'test-game-id' })
      })
    )
  })

  it('undoes last action', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockGameState)
    })

    const result = await gameService.undo('test-game-id')
    
    expect(result).toEqual(mockGameState)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/undo',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ game_id: 'test-game-id' })
      })
    )
  })

  it('handles API errors', async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ detail: 'Game not found' })
    })

    await expect(gameService.getGameState('invalid-id')).rejects.toThrow('Game not found')
  })
})
