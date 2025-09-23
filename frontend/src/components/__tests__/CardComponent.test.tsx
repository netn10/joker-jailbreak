import { render, screen } from '@testing-library/react'
import { CardComponent } from '../CardComponent'
import type { Card } from '../../types/GameState'

const mockCard: Card = {
  id: 'test-card',
  suit: 'H',
  rank: 'A',
  value: 1,
  color: 'red'
}

describe('CardComponent', () => {
  it('renders card with correct rank and suit', () => {
    const mockOnClick = vi.fn()
    render(<CardComponent card={mockCard} selected={false} onClick={mockOnClick} />)
    
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('♥')).toBeInTheDocument()
  })

  it('applies red color class for red cards', () => {
    const mockOnClick = vi.fn()
    render(<CardComponent card={mockCard} selected={false} onClick={mockOnClick} />)
    
    const cardElement = screen.getByText('A').closest('.card')
    expect(cardElement).toHaveClass('red')
  })

  it('applies black color class for black cards', () => {
    const blackCard: Card = { ...mockCard, suit: 'S', color: 'black' }
    const mockOnClick = vi.fn()
    render(<CardComponent card={blackCard} selected={false} onClick={mockOnClick} />)
    
    const cardElement = screen.getByText('A').closest('.card')
    expect(cardElement).toHaveClass('black')
  })

  it('applies selected class when selected', () => {
    const mockOnClick = vi.fn()
    render(<CardComponent card={mockCard} selected={true} onClick={mockOnClick} />)
    
    const cardElement = screen.getByText('A').closest('.card')
    expect(cardElement).toHaveClass('selected')
  })

  it('calls onClick when clicked', () => {
    const mockOnClick = vi.fn()
    render(<CardComponent card={mockCard} selected={false} onClick={mockOnClick} />)
    
    const cardElement = screen.getByText('A').closest('.card')
    cardElement?.click()
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
})
