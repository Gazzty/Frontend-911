import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from './test-utils'
import AlertasRecientes from '../components/dashboard/AlertasRecientes'
import * as eventsLogApi from '../api/eventsLogApi'
import type { EventLogItem } from '../api/eventsLogApi'

vi.mock('framer-motion', () => ({
  motion: { create: (Comp: any) => Comp },
  AnimatePresence: ({ children }: any) => children,
}))

vi.mock('../api/eventsLogApi', () => ({
  getLastEventsByTypes: vi.fn(),
}))

const makeAlerta = (
  id: number,
  summary: string,
  detail = 'Incendio detectado',
  alertLogTypeId = 2,
): EventLogItem => ({
  date: '2024-01-01T10:00:00',
  alertLogTypeId,
  alertLogTypeDescription: 'Fire',
  detail,
  summary,
})

describe('AlertasRecientes – Dashboard alert', () => {
  beforeEach(() => {
    vi.mocked(eventsLogApi.getLastEventsByTypes).mockResolvedValue({
      success: true,
      errors: null,
      payload: [],
    })
  })

  it('renders nothing when no fire alerts are returned', async () => {
    const { container } = render(<AlertasRecientes />)
    await waitFor(() => expect(eventsLogApi.getLastEventsByTypes).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the "Alertas recientes" heading when there are fire alerts', async () => {
    vi.mocked(eventsLogApi.getLastEventsByTypes).mockResolvedValue({
      success: true,
      errors: null,
      payload: [makeAlerta(1, 'Celda Fuego')],
    })
    render(<AlertasRecientes />)
    expect(await screen.findByText('Alertas recientes')).toBeInTheDocument()
  })

  it('displays the summary for each fire alert', async () => {
    vi.mocked(eventsLogApi.getLastEventsByTypes).mockResolvedValue({
      success: true,
      errors: null,
      payload: [makeAlerta(1, 'Celda Incendio')],
    })
    render(<AlertasRecientes />)
    expect(await screen.findByText('Celda Incendio')).toBeInTheDocument()
  })

  it('displays the detail for each fire alert', async () => {
    vi.mocked(eventsLogApi.getLastEventsByTypes).mockResolvedValue({
      success: true,
      errors: null,
      payload: [makeAlerta(1, 'Celda Fuego', 'Temp. crítica: 92°C')],
    })
    render(<AlertasRecientes />)
    expect(await screen.findByText('Temp. crítica: 92°C')).toBeInTheDocument()
  })

  it('displays all returned fire alerts', async () => {
    const payload = Array.from({ length: 5 }, (_, i) =>
      makeAlerta(i + 1, `Celda ${i + 1}`),
    )
    vi.mocked(eventsLogApi.getLastEventsByTypes).mockResolvedValue({
      success: true,
      errors: null,
      payload,
    })
    render(<AlertasRecientes />)
    for (let i = 1; i <= 5; i++) {
      expect(await screen.findByText(`Celda ${i}`)).toBeInTheDocument()
    }
  })
})
