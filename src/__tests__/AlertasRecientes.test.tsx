import { describe, it, expect, vi } from 'vitest'
import { render, screen } from './test-utils'
import AlertasRecientes from '../components/dashboard/AlertasRecientes'
import type { Celda } from '../types'

vi.mock('framer-motion', () => ({
  motion: { create: (Comp: any) => Comp },
  AnimatePresence: ({ children }: any) => children,
}))

const makeCelda = (id: number, nombre: string, enFuego: boolean, temperatura = 80): Celda => ({
  id,
  nombre,
  timestamp: '10:00:00',
  activa: true,
  sensores: [{ id, temperatura, enFuego, tipo: 'temperatura' }],
  ubicacion: { lat: -34.6, lng: -58.4 },
})

describe('AlertasRecientes – Dashboard alert', () => {
  it('renders nothing when no cells have fire sensors', () => {
    const normalCeldas = [makeCelda(1, 'Celda A', false), makeCelda(2, 'Celda B', false)]
    const { container } = render(<AlertasRecientes celdas={normalCeldas} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the "Alertas recientes" heading when there are fire alerts', () => {
    const celdas = [makeCelda(1, 'Celda Fuego', true)]
    render(<AlertasRecientes celdas={celdas} />)
    expect(screen.getByText('Alertas recientes')).toBeInTheDocument()
  })

  it('displays the cell name for each active fire alert', () => {
    const celdas = [makeCelda(1, 'Celda Incendio', true)]
    render(<AlertasRecientes celdas={celdas} />)
    expect(screen.getByText('Celda Incendio')).toBeInTheDocument()
  })

  it('displays the critical temperature in each alert', () => {
    const celdas = [makeCelda(1, 'Celda Fuego', true, 92)]
    render(<AlertasRecientes celdas={celdas} />)
    expect(screen.getByText('Temp. crítica: 92°C')).toBeInTheDocument()
  })

  it('limits the displayed alerts to a maximum of 3', () => {
    const celdas = [
      makeCelda(1, 'Celda 1', true),
      makeCelda(2, 'Celda 2', true),
      makeCelda(3, 'Celda 3', true),
      makeCelda(4, 'Celda 4', true),
      makeCelda(5, 'Celda 5', true),
    ]
    render(<AlertasRecientes celdas={celdas} />)

    expect(screen.getByText('Celda 1')).toBeInTheDocument()
    expect(screen.getByText('Celda 2')).toBeInTheDocument()
    expect(screen.getByText('Celda 3')).toBeInTheDocument()
    expect(screen.queryByText('Celda 4')).not.toBeInTheDocument()
    expect(screen.queryByText('Celda 5')).not.toBeInTheDocument()
  })
})
