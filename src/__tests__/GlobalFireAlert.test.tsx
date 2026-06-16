import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import GlobalFireAlert from '../components/GlobalFireAlert'
import * as SensorDataContext from '../context/SensorDataContext'
import type { useSensorData } from '../context/SensorDataContext'
import { system } from '../theme/themes'
import type { Celda } from '../types'

type SensorDataContextType = ReturnType<typeof useSensorData>

vi.mock('framer-motion', () => ({
  motion: { create: (Comp: any) => Comp },
  AnimatePresence: ({ children }: any) => children,
}))

const makeCelda = (id: number, enFuego = false, temperatura = 25): Celda => ({
  id,
  nombre: `Celda ${id}`,
  timestamp: '10:00:00',
  activa: true,
  sensores: [
    { id, temperatura, enFuego, tipo: enFuego ? 'fuego' : 'temperatura' },
  ],
  ubicacion: { lat: -34.6, lng: -58.4 },
})

const DEFAULT_CONTEXT: SensorDataContextType = {
  mediciones: [],
  historialMediciones: [],
  celdas: [],
  connectionStatus: 'conectado',
  lastUpdate: null,
  intervaloMedicion: 10,
  setIntervaloMedicion: vi.fn(),
  cargandoCeldas: false,
  refreshCeldas: vi.fn(),
  umbralTemperatura: 50,
} as unknown as SensorDataContextType

function mockSensorData(overrides: Partial<SensorDataContextType> = {}) {
  vi.spyOn(SensorDataContext, 'useSensorData').mockReturnValue({
    ...DEFAULT_CONTEXT,
    ...overrides,
  })
}

function renderAtRoute(path: string) {
  return render(
    <ChakraProvider value={system}>
      <MemoryRouter initialEntries={[path]}>
        <GlobalFireAlert />
      </MemoryRouter>
    </ChakraProvider>
  )
}

describe('GlobalFireAlert', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when there are no fire or temperature alerts', () => {
    mockSensorData({ celdas: [makeCelda(1)] })
    const { container } = renderAtRoute('/dashboard')
    expect(container.querySelector('[data-testid="fire-alert"]')).toBeNull()
    expect(screen.queryByText('¡ALERTA DE INCENDIO!')).not.toBeInTheDocument()
  })

  it('shows the alert when a cell is on fire', () => {
    mockSensorData({ celdas: [makeCelda(1, true)] })
    renderAtRoute('/dashboard')
    expect(screen.getByText('¡ALERTA DE INCENDIO!')).toBeInTheDocument()
  })

  it('shows the warning alert when temperature exceeds the threshold', () => {
    mockSensorData({
      celdas: [makeCelda(1, false, 80)],
      umbralTemperatura: 50,
    })
    renderAtRoute('/dashboard')
    expect(screen.getByText('ALERTA DE POSIBILIDAD DE INCENDIO')).toBeInTheDocument()
  })

  it('hides the alert after the user dismisses it', () => {
    mockSensorData({ celdas: [makeCelda(1, true)] })
    renderAtRoute('/dashboard')
    expect(screen.getByText('¡ALERTA DE INCENDIO!')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Entendido, cerrar alerta'))
    expect(screen.queryByText('¡ALERTA DE INCENDIO!')).not.toBeInTheDocument()
  })

  it('does not re-show the alert when the same fire count stays the same after dismissal', () => {
    mockSensorData({ celdas: [makeCelda(1, true)] })
    const { rerender } = renderAtRoute('/dashboard')
    fireEvent.click(screen.getByText('Entendido, cerrar alerta'))
    // Rerender with same data — simulates switching tabs and back without new alerts
    rerender(
      <ChakraProvider value={system}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <GlobalFireAlert />
        </MemoryRouter>
      </ChakraProvider>
    )
    expect(screen.queryByText('¡ALERTA DE INCENDIO!')).not.toBeInTheDocument()
  })

  it('re-shows the alert when a new fire cell is detected after dismissal', () => {
    mockSensorData({ celdas: [makeCelda(1, true)] })
    const { rerender } = renderAtRoute('/dashboard')
    fireEvent.click(screen.getByText('Entendido, cerrar alerta'))
    expect(screen.queryByText('¡ALERTA DE INCENDIO!')).not.toBeInTheDocument()

    // A second cell catches fire — count goes from 1 → 2
    mockSensorData({ celdas: [makeCelda(1, true), makeCelda(2, true)] })
    rerender(
      <ChakraProvider value={system}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <GlobalFireAlert />
        </MemoryRouter>
      </ChakraProvider>
    )
    expect(screen.getByText('¡ALERTA DE INCENDIO!')).toBeInTheDocument()
  })

  it('does not render on excluded routes', () => {
    mockSensorData({ celdas: [makeCelda(1, true)] })
    renderAtRoute('/login')
    expect(screen.queryByText('¡ALERTA DE INCENDIO!')).not.toBeInTheDocument()
  })
})
