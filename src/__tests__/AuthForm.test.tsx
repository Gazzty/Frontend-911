import { describe, it, expect, vi } from 'vitest'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from './test-utils'
import AuthForm from '../components/auth/AuthForm'

vi.mock('framer-motion', () => ({
  motion: { create: (Comp: any) => Comp },
  AnimatePresence: ({ children }: any) => children,
}))

const defaultProps = {
  type: 'login' as const,
  onSubmit: vi.fn(),
  isLoading: false,
  error: null,
  onNavigate: vi.fn(),
}

describe('AuthForm – Login', () => {
  it('renders email and password inputs', () => {
    render(<AuthForm {...defaultProps} />)

    expect(screen.getByPlaceholderText('ejemplo@correo.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••••••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('shows email validation error when submitting with empty email', async () => {
    const user = userEvent.setup()
    render(<AuthForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText('El email es requerido')).toBeInTheDocument()
    })
  })

  it('shows password validation error when submitting with empty password', async () => {
    const user = userEvent.setup()
    render(<AuthForm {...defaultProps} />)

    await user.type(screen.getByPlaceholderText('ejemplo@correo.com'), 'admin@incendios.com')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument()
    })
  })

  it('shows invalid email error for bad email format', async () => {
    const user = userEvent.setup()
    render(<AuthForm {...defaultProps} />)

    await user.type(screen.getByPlaceholderText('ejemplo@correo.com'), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText('Ingresa un email válido')).toBeInTheDocument()
    })
  })

  it('shows password length error for passwords shorter than 6 characters', async () => {
    const user = userEvent.setup()
    render(<AuthForm {...defaultProps} />)

    await user.type(screen.getByPlaceholderText('ejemplo@correo.com'), 'admin@incendios.com')
    await user.type(screen.getByPlaceholderText('••••••••••••••••••'), '123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument()
    })
  })

  it('calls onSubmit with email and password when the form is valid', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(<AuthForm {...defaultProps} onSubmit={onSubmit} />)

    await user.type(screen.getByPlaceholderText('ejemplo@correo.com'), 'admin@incendios.com')
    await user.type(screen.getByPlaceholderText('••••••••••••••••••'), 'admin123')
    await user.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'admin@incendios.com',
        password: 'admin123',
      })
    })
  })

  it('displays the external error message passed via the error prop', () => {
    render(<AuthForm {...defaultProps} error="Correo o contraseña incorrectos" />)

    expect(screen.getByText('Correo o contraseña incorrectos')).toBeInTheDocument()
  })
})
