import { useState, useEffect } from 'react'
import type { GameState } from '../types/GameState'
import { HintService, type Hint, type PossibleMatch } from '../services/HintService'
import { CardPreview } from './CardPreview'

interface HintDisplayProps {
  gameState: GameState | null
  onHighlightMatches?: (matches: PossibleMatch[]) => void
  onSelectMove?: (cardIds: string[]) => void
}

export function HintDisplay({ gameState, onHighlightMatches, onSelectMove }: HintDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [hints, setHints] = useState<Hint[]>([])
  const [possibleMatches, setPossibleMatches] = useState<PossibleMatch[]>([])
  const [showHighlights, setShowHighlights] = useState(false)
  const hintService = new HintService()

  const updateHints = () => {
    if (gameState) {
      const newHints = hintService.generateHints(gameState)
      const newMatches = hintService.getAllPossibleMatches(gameState)
      setHints(newHints)
      setPossibleMatches(newMatches)
    }
  }

  const toggleHighlights = () => {
    const newShowHighlights = !showHighlights
    setShowHighlights(newShowHighlights)
    
    if (onHighlightMatches) {
      onHighlightMatches(newShowHighlights ? possibleMatches : [])
    }
  }

  useEffect(() => {
    if (gameState) {
      updateHints()
    }
  }, [gameState])

  const handleToggle = () => {
    if (!isExpanded) {
      updateHints()
    }
    setIsExpanded(!isExpanded)
  }

  const getHintIcon = (type: Hint['type']) => {
    switch (type) {
      case 'match': return '💡'
      case 'draw': return '🃏'
      case 'strategy': return '🎯'
      case 'warning': return '⚠️'
      default: return '💡'
    }
  }

  const getHintPriorityColor = (priority: Hint['priority']) => {
    switch (priority) {
      case 'high': return 'hint-high'
      case 'medium': return 'hint-medium'
      case 'low': return 'hint-low'
      default: return 'hint-medium'
    }
  }

  if (!gameState || gameState.game_over) {
    return null
  }

  return (
    <div className="hint-display">
      <button
        onClick={handleToggle}
        className="hint-toggle"
        title={isExpanded ? 'Hide hints' : 'Show hints'}
      >
        {isExpanded ? '💡 Hide Hints' : '💡 Get Hints'}
        {hints.length > 0 && !isExpanded && (
          <span className="hint-count">{hints.length}</span>
        )}
      </button>
      
      {isExpanded && (
        <div className="hint-panel">
          <div className="hint-header">
            <h3>Game Hints</h3>
            <div className="hint-controls">
              <button
                onClick={toggleHighlights}
                className={`highlight-toggle ${showHighlights ? 'active' : ''}`}
                title={showHighlights ? 'Hide highlights' : 'Show all possible moves'}
              >
                {showHighlights ? '🎯 Hide' : '🎯 Show'} Moves ({possibleMatches.length})
              </button>
              <button
                onClick={updateHints}
                className="refresh-hints"
                title="Refresh hints"
              >
                🔄
              </button>
            </div>
          </div>
          
          {hints.length === 0 && possibleMatches.length === 0 ? (
            <div className="no-hints">
              <p>No specific hints available. Keep playing strategically!</p>
            </div>
          ) : (
            <div className="hint-content">
              {hints.length > 0 && (
                <div className="hint-section">
                  <h4>Strategic Hints</h4>
                  <div className="hint-list">
                    {hints.map((hint, index) => (
                      <div
                        key={index}
                        className={`hint-item ${getHintPriorityColor(hint.priority)}`}
                      >
                        <div className="hint-icon">
                          {getHintIcon(hint.type)}
                        </div>
                        <div className="hint-content">
                          <p className="hint-message">{hint.message}</p>
                          {hint.cards && hint.cards.length > 0 && (
                            <div className="hint-cards">
                              <small>Relevant cards: {hint.cards.join(', ')}</small>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {possibleMatches.length > 0 && (
                <div className="hint-section">
                  <h4>Possible Moves ({possibleMatches.length})</h4>
                  <div className="possible-matches">
                    {possibleMatches.slice(0, 5).map((match, index) => (
                      <div 
                        key={index} 
                        className="match-item"
                        onClick={() => onSelectMove?.([match.card1Id, match.card2Id])}
                        style={{ cursor: onSelectMove ? 'pointer' : 'default' }}
                        title={onSelectMove ? 'Click to select this move' : undefined}
                      >
                        <div className="match-cards">
                          <CardPreview card={match.card1} size="small" />
                          <span className="match-connector">↔</span>
                          <CardPreview card={match.card2} size="small" />
                        </div>
                        <div className="match-value">
                          Value: {match.value}
                        </div>
                      </div>
                    ))}
                    {possibleMatches.length > 5 && (
                      <div className="more-matches">
                        +{possibleMatches.length - 5} more matches
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

