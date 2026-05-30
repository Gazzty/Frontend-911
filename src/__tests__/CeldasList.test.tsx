import { describe, it, expect, vi } from 'vitest'
import { render, screen } from './test-utils'
import CeldasList from '../components/dashboard/CeldasList'
import type { Celda } from '../types'

vi.mock('framer-motion', () => ({
  motion: { create: (Comp: any) => Comp },
  AnimatePresence: ({ children }: any) => children,
}))

const mockCeldas: Celda[] = [
  {
    id: 1,
    nombre: 'Celda Norte',
    timestamp: '10:30:00',
    activa: true,
    sensores: [
      { id: 1, temperatura: 35, enFuego: false, tipo: 'temperatura' },
    ],
    ubicacion: { lat: -34.6, lng: -58.4 },
  },
  {
    id: 2,
    nombre: 'Celda Sur',
    timestamp: '10:31:00',
    activa: true,
    sensores: [
      { id: 2, temperatura: 75, enFuego: true, tipo: 'temperatura' },
    ],
    ubicacion: { lat: -34.7, lng: -58.5 },
  },
]

describe('CeldasList – Dashboard cells data', () => {
  it('renders the "Estado de las celdas" heading', () => {
    render(<CeldasList celdas={mockCeldas} />)
    expect(screen.getByText('Estado de las celdas')).toBeInTheDocument()
  })

  it('renders all cell names', () => {
    render(<CeldasList celdas={mockCeldas} />)
    expect(screen.getByText('Celda Norte')).toBeInTheDocument()
    expect(screen.getByText('Celda Sur')).toBeInTheDocument()
  })

  it('shows ALERTA badge for cells with enFuego sensors', () => {
    render(<CeldasList celdas={mockCeldas} />)
    expect(screen.getByText('ALERTA')).toBeInTheDocument()
  })

  it('shows NORMAL badge for cells without fire', () => {
    render(<CeldasList celdas={mockCeldas} />)
    expect(screen.getByText('NORMAL')).toBeInTheDocument()
  })

  it('displays the temperature from the temperatura sensor', () => {
    render(<CeldasList celdas={mockCeldas} />)
    expect(screen.getByText('35°C')).toBeInTheDocument()
    expect(screen.getByText('75°C')).toBeInTheDocument()
  })
})
