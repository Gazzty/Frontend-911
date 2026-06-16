import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from './test-utils'
import CeldasSidebar from '../components/map/CeldasSidebar'
import type { Celda } from '../types'

vi.mock('framer-motion', () => ({
  motion: { create: (Comp: any) => Comp },
  AnimatePresence: ({ children }: any) => children,
}))

const mockCeldas: Celda[] = [
  {
    id: 1,
    nombre: 'Celda Oeste',
    timestamp: '09:15:00',
    activa: true,
    sensores: [{ id: 1, temperatura: 28, enFuego: false, tipo: 'temperatura' }],
    ubicacion: { lat: -34.6, lng: -58.4 },
  },
  {
    id: 2,
    nombre: 'Celda Este',
    timestamp: '09:16:00',
    activa: true,
    sensores: [{ id: 2, temperatura: 85, enFuego: true, tipo: 'temperatura' }],
    ubicacion: { lat: -34.7, lng: -58.5 },
  },
]

describe('CeldasSidebar – Map cells data', () => {
  it('renders the "Celdas" heading', () => {
    render(<CeldasSidebar celdas={mockCeldas} />)
    expect(screen.getByText('Celdas')).toBeInTheDocument()
  })

  it('displays all cell names from the celdas prop', () => {
    render(<CeldasSidebar celdas={mockCeldas} />)
    expect(screen.getByText('Celda Oeste')).toBeInTheDocument()
    expect(screen.getByText('Celda Este')).toBeInTheDocument()
  })

  it('calls onCeldaClick with the correct celda when a cell is clicked', async () => {
    const onCeldaClick = vi.fn()
    const user = userEvent.setup()
    render(<CeldasSidebar celdas={mockCeldas} onCeldaClick={onCeldaClick} />)

    await user.click(screen.getByText('Celda Oeste'))

    expect(onCeldaClick).toHaveBeenCalledWith(mockCeldas[0])
  })

  it('shows ALERTA badge for cells with active fire sensors', () => {
    render(<CeldasSidebar celdas={mockCeldas} />)
    expect(screen.getByText('ALERTA')).toBeInTheDocument()
  })
})
