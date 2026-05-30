import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { MemoryRouter } from 'react-router-dom'
import { system } from '../theme/themes'

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={system}>
    <MemoryRouter>{children}</MemoryRouter>
  </ChakraProvider>
)

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
