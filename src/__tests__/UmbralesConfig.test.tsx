import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from './test-utils'
import UmbralesConfig from '../components/config/UmbralesConfig'

vi.mock('framer-motion', () => ({
  motion: { create: (Comp: any) => Comp },
  AnimatePresence: ({ children }: any) => children,
}))

vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>()
  return {
    ...actual,
    createToaster: () => ({
      create: vi.fn(),
      dismiss: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      promise: vi.fn(),
    }),
  }
})

const defaultProps = {
  temperatura: 50,
  intervaloMedicion: 600,
  onSave: vi.fn(),
}

describe('UmbralesConfig – Config page data', () => {
  it('displays the initial temperature value in the input', () => {
    render(<UmbralesConfig {...defaultProps} />)
    const tempInput = screen.getByPlaceholderText('Ej: 50')
    expect(tempInput).toHaveValue('50')
  })

  it('displays the initial intervalo value in the input', () => {
    render(<UmbralesConfig {...defaultProps} />)
    const intervaloInput = screen.getByPlaceholderText('Ej: 600')
    expect(intervaloInput).toHaveValue('600')
  })

  it('save button is disabled when no changes have been made', () => {
    render(<UmbralesConfig {...defaultProps} />)
    const button = screen.getByRole('button', { name: /sin cambios/i })
    expect(button).toBeDisabled()
  })

  it('save button becomes enabled when the temperature is changed', async () => {
    const user = userEvent.setup()
    render(<UmbralesConfig {...defaultProps} />)

    const tempInput = screen.getByPlaceholderText('Ej: 50')
    await user.clear(tempInput)
    await user.type(tempInput, '60')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /guardar cambios/i })).not.toBeDisabled()
    })
  })

  it('shows an error when temperature exceeds 100°C', async () => {
    const user = userEvent.setup()
    render(<UmbralesConfig {...defaultProps} />)

    const tempInput = screen.getByPlaceholderText('Ej: 50')
    await user.clear(tempInput)
    await user.type(tempInput, '150')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Máximo 100°C')).toBeInTheDocument()
    })
  })

  it('shows an error when temperature is 0 or below', async () => {
    const user = userEvent.setup()
    render(<UmbralesConfig {...defaultProps} />)

    const tempInput = screen.getByPlaceholderText('Ej: 50')
    await user.clear(tempInput)
    await user.type(tempInput, '0')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Debe ser mayor a 0°C')).toBeInTheDocument()
    })
  })

  it('shows an error when intervalo is below the minimum of 10 seconds', async () => {
    const user = userEvent.setup()
    render(<UmbralesConfig {...defaultProps} />)

    const intervaloInput = screen.getByPlaceholderText('Ej: 600')
    await user.clear(intervaloInput)
    await user.type(intervaloInput, '5')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Mínimo 10 segundos')).toBeInTheDocument()
    })
  })

  it('shows an error when intervalo exceeds the maximum of 3600 seconds', async () => {
    const user = userEvent.setup()
    render(<UmbralesConfig {...defaultProps} />)

    const intervaloInput = screen.getByPlaceholderText('Ej: 600')
    await user.clear(intervaloInput)
    await user.type(intervaloInput, '4000')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('Máximo 3600 segundos')).toBeInTheDocument()
    })
  })
})
