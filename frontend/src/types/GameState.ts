export interface Card {
  id: string
  suit: string
  rank: string
  value: number
  color: 'red' | 'black'
}

export interface GameState {
  seed: number
  walls: Record<string, Card[]>
  corners: Record<string, Card[]>
  joker_stack: Card[]
  remainder: number
  game_over: boolean
  won: boolean
  lost: boolean
}

export interface NewGameResponse {
  game_id: string
  state: GameState
}

export interface MatchRequest {
  game_id: string
  card_ids: string[]
}

export interface DrawRequest {
  game_id: string
}

export interface UndoRequest {
  game_id: string
}
