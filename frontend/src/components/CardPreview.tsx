import type { Card } from '../types/GameState'

interface CardPreviewProps {
  card: Card
  size?: 'small' | 'medium'
  onClick?: () => void
}

export function CardPreview({ card, size = 'small', onClick }: CardPreviewProps) {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'H': return '♥'
      case 'D': return '♦'
      case 'C': return '♣'
      case 'S': return '♠'
      default: return suit
    }
  }

  const sizeClass = size === 'medium' ? 'card-preview-medium' : 'card-preview-small'
  const clickableClass = onClick ? 'card-preview-clickable' : ''

  return (
    <div
      className={`card-preview ${card.color} ${sizeClass} ${clickableClass}`}
      onClick={onClick}
      title={`${card.rank} of ${getSuitSymbol(card.suit)}`}
    >
      <div className="card-preview-rank">{card.rank}</div>
      <div className="card-preview-suit">{getSuitSymbol(card.suit)}</div>
    </div>
  )
}
