import type { GameState, NewGameResponse, MatchRequest, DrawRequest, UndoRequest } from '../types/GameState'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export class GameService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async createGame(): Promise<NewGameResponse> {
    return this.request<NewGameResponse>('/api/new-game', {
      method: 'POST',
    })
  }

  async getGameState(gameId: string): Promise<GameState> {
    return this.request<GameState>(`/api/state/${gameId}`)
  }

  async makeMatch(gameId: string, cardIds: string[]): Promise<GameState> {
    const request: MatchRequest = {
      game_id: gameId,
      card_ids: cardIds,
    }
    return this.request<GameState>('/api/match', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async drawCard(gameId: string): Promise<GameState> {
    const request: DrawRequest = {
      game_id: gameId,
    }
    return this.request<GameState>('/api/draw', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async undo(gameId: string): Promise<GameState> {
    const request: UndoRequest = {
      game_id: gameId,
    }
    return this.request<GameState>('/api/undo', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }
}
