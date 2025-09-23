import { useState } from 'react'
import { CardComponent } from './CardComponent'
import type { GameState, Card } from '../types/GameState'
import type { PossibleMatch } from '../services/HintService'

interface GameBoardProps {
  gameState: GameState | null
  onCardSelect: (cardIds: string[]) => void
  highlightedMatches?: PossibleMatch[]
}

export function GameBoard({ gameState, onCardSelect, highlightedMatches = [] }: GameBoardProps) {
  const [selectedCards, setSelectedCards] = useState<string[]>([])

  if (!gameState) return null

  // Get highlighted card IDs
  const highlightedCardIds = new Set<string>()
  highlightedMatches.forEach(match => {
    highlightedCardIds.add(match.card1Id)
    highlightedCardIds.add(match.card2Id)
  })

  const handleCardClick = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter(id => id !== cardId))
    } else {
      setSelectedCards([...selectedCards, cardId])
    }
  }

  const handleMatch = () => {
    if (selectedCards.length >= 2) {
      onCardSelect(selectedCards)
      setSelectedCards([])
    }
  }

  const handleClearSelection = () => {
    setSelectedCards([])
  }

  const getVisibleCards = (): Record<string, Card> => {
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

  const visibleCards = getVisibleCards()

  return (
    <div className="game-board">
      <div className="board-layout">
        {/* North wall */}
        <div className="wall-row north">
          <div className="corner-card">
            {visibleCards['C:NW'] && (
              <div className="pile-container">
                <CardComponent
                  card={visibleCards['C:NW']}
                  selected={selectedCards.includes(visibleCards['C:NW'].id)}
                  highlighted={highlightedCardIds.has(visibleCards['C:NW'].id)}
                  onClick={() => handleCardClick(visibleCards['C:NW'].id)}
                />
                <div className="pile-count">{gameState.corners['NW']?.length || 0}</div>
              </div>
            )}
          </div>
          <div className="wall-card">
            {visibleCards['W:N'] && (
              <div className="pile-container">
                <CardComponent
                  card={visibleCards['W:N']}
                  selected={selectedCards.includes(visibleCards['W:N'].id)}
                  highlighted={highlightedCardIds.has(visibleCards['W:N'].id)}
                  onClick={() => handleCardClick(visibleCards['W:N'].id)}
                />
                <div className="pile-count">{gameState.walls['N']?.length || 0}</div>
              </div>
            )}
          </div>
          <div className="corner-card">
            {visibleCards['C:NE'] && (
              <div className="pile-container">
                <CardComponent
                  card={visibleCards['C:NE']}
                  selected={selectedCards.includes(visibleCards['C:NE'].id)}
                  highlighted={highlightedCardIds.has(visibleCards['C:NE'].id)}
                  onClick={() => handleCardClick(visibleCards['C:NE'].id)}
                />
                <div className="pile-count">{gameState.corners['NE']?.length || 0}</div>
              </div>
            )}
          </div>
        </div>

        {/* Middle row with Joker */}
        <div className="middle-row">
          <div className="wall-card">
            {visibleCards['W:W'] && (
              <div className="pile-container">
                <CardComponent
                  card={visibleCards['W:W']}
                  selected={selectedCards.includes(visibleCards['W:W'].id)}
                  highlighted={highlightedCardIds.has(visibleCards['W:W'].id)}
                  onClick={() => handleCardClick(visibleCards['W:W'].id)}
                />
                <div className="pile-count">{gameState.walls['W']?.length || 0}</div>
              </div>
            )}
          </div>
          <div className="joker-area">
            <div className="joker-card">🃏</div>
          </div>
          <div className="wall-card">
            {visibleCards['W:E'] && (
              <div className="pile-container">
                <CardComponent
                  card={visibleCards['W:E']}
                  selected={selectedCards.includes(visibleCards['W:E'].id)}
                  highlighted={highlightedCardIds.has(visibleCards['W:E'].id)}
                  onClick={() => handleCardClick(visibleCards['W:E'].id)}
                />
                <div className="pile-count">{gameState.walls['E']?.length || 0}</div>
              </div>
            )}
          </div>
        </div>

        {/* South wall */}
        <div className="wall-row south">
          <div className="corner-card">
            {visibleCards['C:SW'] && (
              <div className="pile-container">
                <CardComponent
                  card={visibleCards['C:SW']}
                  selected={selectedCards.includes(visibleCards['C:SW'].id)}
                  highlighted={highlightedCardIds.has(visibleCards['C:SW'].id)}
                  onClick={() => handleCardClick(visibleCards['C:SW'].id)}
                />
                <div className="pile-count">{gameState.corners['SW']?.length || 0}</div>
              </div>
            )}
          </div>
          <div className="wall-card">
            {visibleCards['W:S'] && (
              <div className="pile-container">
                <CardComponent
                  card={visibleCards['W:S']}
                  selected={selectedCards.includes(visibleCards['W:S'].id)}
                  highlighted={highlightedCardIds.has(visibleCards['W:S'].id)}
                  onClick={() => handleCardClick(visibleCards['W:S'].id)}
                />
                <div className="pile-count">{gameState.walls['S']?.length || 0}</div>
              </div>
            )}
          </div>
          <div className="corner-card">
            {visibleCards['C:SE'] && (
              <div className="pile-container">
                <CardComponent
                  card={visibleCards['C:SE']}
                  selected={selectedCards.includes(visibleCards['C:SE'].id)}
                  highlighted={highlightedCardIds.has(visibleCards['C:SE'].id)}
                  onClick={() => handleCardClick(visibleCards['C:SE'].id)}
                />
                <div className="pile-count">{gameState.corners['SE']?.length || 0}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player hand row at the bottom */}
      <div className="hand-zone">
        <h3>Your Cards</h3>
        <div className="hand-cards">
          {gameState.joker_stack.map((card, index) => (
            <CardComponent
              key={card.id}
              card={card}
              selected={selectedCards.includes(card.id)}
              highlighted={highlightedCardIds.has(card.id)}
              onClick={() => handleCardClick(card.id)}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="action-buttons">
        <button
          onClick={handleMatch}
          disabled={selectedCards.length < 2}
          className="match-button"
        >
          Match Cards ({selectedCards.length})
        </button>
        <button
          onClick={handleClearSelection}
          disabled={selectedCards.length === 0}
          className="clear-button"
        >
          Clear Selection
        </button>
      </div>
    </div>
  )
}
