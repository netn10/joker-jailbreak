import type { GameState, Card } from '../types/GameState'

export interface Hint {
  type: 'match' | 'draw' | 'strategy' | 'warning'
  message: string
  priority: 'high' | 'medium' | 'low'
  cards?: string[] // Card IDs that are relevant to this hint
}

export interface PossibleMatch {
  card1: Card
  card2: Card
  card1Id: string
  card2Id: string
  value: number // Combined value of the match
  position1: { x: number; y: number }
  position2: { x: number; y: number }
}

export class HintService {
  private getVisibleCards(gameState: GameState): Record<string, Card> {
    const visible: Record<string, Card> = {}
    
    // Wall cards (top of each stack)
    Object.entries(gameState.walls).forEach(([slot, cards]) => {
      if (cards.length > 0) {
        visible[`W:${slot}`] = cards[cards.length - 1]
      }
    })
    
    // Corner cards (top of each stack)
    Object.entries(gameState.corners).forEach(([slot, cards]) => {
      if (cards.length > 0) {
        visible[`C:${slot}`] = cards[cards.length - 1]
      }
    })
    
    // Joker stack cards
    gameState.joker_stack.forEach((card, index) => {
      visible[`J:${index}`] = card
    })
    
    return visible
  }

  private canMatch(card1: Card, card2: Card): boolean {
    // Legal match: one red card and one black card with equal values
    const hasRed = card1.color === 'red' || card2.color === 'red'
    const hasBlack = card1.color === 'black' || card2.color === 'black'
    const valuesEqual = card1.value === card2.value
    
    return hasRed && hasBlack && valuesEqual
  }

  private findPossibleMatches(visibleCards: Record<string, Card>): Array<{cards: Card[], ids: string[]}> {
    const cardEntries = Object.entries(visibleCards)
    const legalMatches = this.findLegalMatches(cardEntries)
    
    // Return only 2-card matches for backward compatibility
    return legalMatches.filter(match => match.cards.length === 2)
  }

  private getCardPosition(cardId: string): { x: number; y: number } {
    // Parse card ID to determine position on board
    const [type, position] = cardId.split(':')
    
    switch (type) {
      case 'W': // Wall cards
        switch (position) {
          case 'N': return { x: 1, y: 0 }
          case 'S': return { x: 1, y: 2 }
          case 'E': return { x: 2, y: 1 }
          case 'W': return { x: 0, y: 1 }
          default: return { x: 0, y: 0 }
        }
      case 'C': // Corner cards
        switch (position) {
          case 'NW': return { x: 0, y: 0 }
          case 'NE': return { x: 2, y: 0 }
          case 'SW': return { x: 0, y: 2 }
          case 'SE': return { x: 2, y: 2 }
          default: return { x: 0, y: 0 }
        }
      case 'J': // Joker stack cards
        return { x: 1, y: 1 }
      case 'H': // Hand cards
        return { x: 3, y: 1 } // Positioned to the right of the board
      default:
        return { x: 0, y: 0 }
    }
  }

  public getAllPossibleMatches(gameState: GameState): PossibleMatch[] {
    const visibleCards = this.getVisibleCards(gameState)
    const matches: PossibleMatch[] = []
    const cardEntries = Object.entries(visibleCards)
    
    // Find all legal matches (including multi-card combinations)
    const legalMatches = this.findLegalMatches(cardEntries)
    
    // Convert to PossibleMatch format (for now, only support 2-card matches in the UI)
    for (const match of legalMatches) {
      if (match.cards.length === 2) {
        const [card1, card2] = match.cards
        const [id1, id2] = match.ids
        const value = card1.value + card2.value
        
        matches.push({
          card1,
          card2,
          card1Id: id1,
          card2Id: id2,
          value,
          position1: this.getCardPosition(id1),
          position2: this.getCardPosition(id2)
        })
      }
    }
    
    // Sort by value (highest first)
    return matches.sort((a, b) => b.value - a.value)
  }

  private findLegalMatches(cardEntries: Array<[string, Card]>): Array<{cards: Card[], ids: string[]}> {
    const matches: Array<{cards: Card[], ids: string[]}> = []
    
    // Find all possible combinations of cards
    const allCombinations = this.getAllCardCombinations(cardEntries)
    
    for (const combination of allCombinations) {
      if (this.isLegalMatch(combination.cards)) {
        matches.push(combination)
      }
    }
    
    return matches
  }

  private getAllCardCombinations(cardEntries: Array<[string, Card]>): Array<{cards: Card[], ids: string[]}> {
    const combinations: Array<{cards: Card[], ids: string[]}> = []
    const n = cardEntries.length
    
    // Generate all possible combinations of 2 or more cards
    // Using bit manipulation to generate all subsets
    for (let mask = 1; mask < (1 << n); mask++) {
      const cards: Card[] = []
      const ids: string[] = []
      
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          const [id, card] = cardEntries[i]
          cards.push(card)
          ids.push(id)
        }
      }
      
      // Only consider combinations with 2 or more cards
      if (cards.length >= 2) {
        combinations.push({ cards, ids })
      }
    }
    
    return combinations
  }

  private isLegalMatch(cards: Card[]): boolean {
    // Legal match must have at least one red and one black card
    const reds = cards.filter(card => card.color === 'red')
    const blacks = cards.filter(card => card.color === 'black')
    
    if (reds.length === 0 || blacks.length === 0) {
      return false
    }
    
    // Red cards sum must equal black cards sum
    const redSum = reds.reduce((sum, card) => sum + card.value, 0)
    const blackSum = blacks.reduce((sum, card) => sum + card.value, 0)
    
    return redSum === blackSum
  }

  private getCardValue(card: Card): number {
    // Higher value cards are generally better to match
    if (card.rank === 'A') return 14
    if (card.rank === 'K') return 13
    if (card.rank === 'Q') return 12
    if (card.rank === 'J') return 11
    return card.value
  }

  private analyzeWallClearance(gameState: GameState): Hint[] {
    const hints: Hint[] = []
    const wallCounts = Object.values(gameState.walls).map(wall => wall.length)
    const minWallHeight = Math.min(...wallCounts)
    const maxWallHeight = Math.max(...wallCounts)
    
    if (minWallHeight === 0) {
      hints.push({
        type: 'strategy',
        message: '🎉 You have a clear wall! Focus on clearing another wall to win.',
        priority: 'high'
      })
    } else if (maxWallHeight - minWallHeight > 3) {
      hints.push({
        type: 'strategy',
        message: '⚖️ Balance your wall heights. Try to clear the tallest walls first.',
        priority: 'medium'
      })
    }
    
    return hints
  }

  private analyzeJokerStack(gameState: GameState): Hint[] {
    const hints: Hint[] = []
    
    if (gameState.joker_stack.length >= 3) {
      hints.push({
        type: 'warning',
        message: '⚠️ Joker stack is full! You must clear a wall before drawing more cards.',
        priority: 'high'
      })
    } else if (gameState.joker_stack.length === 2) {
      hints.push({
        type: 'strategy',
        message: '🎯 Joker stack is almost full. Consider your next move carefully.',
        priority: 'medium'
      })
    }
    
    return hints
  }


  private analyzeRemainder(gameState: GameState): Hint[] {
    const hints: Hint[] = []
    
    if (gameState.remainder <= 5) {
      hints.push({
        type: 'strategy',
        message: `📊 Only ${gameState.remainder} cards left in deck. Plan your moves carefully!`,
        priority: 'medium'
      })
    }
    
    if (gameState.remainder === 0 && gameState.joker_stack.length < 3) {
      hints.push({
        type: 'strategy',
        message: '🎯 Deck is empty. Focus on matching cards to clear walls.',
        priority: 'high'
      })
    }
    
    return hints
  }

  public generateHints(gameState: GameState): Hint[] {
    if (gameState.game_over) {
      return []
    }
    
    const hints: Hint[] = []
    
    // Analyze different aspects of the game
    hints.push(...this.analyzeWallClearance(gameState))
    hints.push(...this.analyzeJokerStack(gameState))
    hints.push(...this.analyzeRemainder(gameState))
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    hints.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    
    return hints
  }
}
