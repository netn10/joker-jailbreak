import type { Card } from '../types/GameState'

interface CardComponentProps {
  card: Card
  selected: boolean
  highlighted?: boolean
  onClick: () => void
}

export function CardComponent({ card, selected, highlighted = false, onClick }: CardComponentProps) {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'H': return '♥'
      case 'D': return '♦'
      case 'C': return '♣'
      case 'S': return '♠'
      default: return suit
    }
  }

  return (
    <div
      className={`card ${card.color} ${selected ? 'selected' : ''} ${highlighted ? 'highlighted' : ''}`}
      onClick={onClick}
    >
      <div className="card-rank">{card.rank}</div>
      <div className="card-suit">{getSuitSymbol(card.suit)}</div>
    </div>
  )
}
