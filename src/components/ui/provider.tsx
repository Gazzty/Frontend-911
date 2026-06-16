"use client"

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode"

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          orange: { value: '#FF4500' },
          beige:  { value: '#F5F1ED' },
          black:  { value: '#000000' },
          white:  { value: '#FFFFFF' },
        },
        gray: {
          50:  { value: '#FAFAFA' },
          100: { value: '#F7F7F7' },
          200: { value: '#E8E8E8' },
          300: { value: '#D1D1D1' },
          500: { value: '#6B6B6B' },
          700: { value: '#2D2D2D' },
        },
        green: { 400: { value: '#51CF66' } },
        red: {
          400: { value: '#FF6B6B' },
          500: { value: '#FF4500' },
        },
      },
    },
    semanticTokens: {
      colors: {
        bg: {
          default: { value: { _light: '#FFFFFF',  _dark: '#1A202C' } },
          subtle:  { value: { _light: '#FAFAFA',  _dark: '#171923' } },
          muted:   { value: { _light: '#F0F0F0',  _dark: '#2D3748' } },
          input:   { value: { _light: '#F7F7F7',  _dark: '#2D3748' } },
          page:    { value: { _light: '#F5F1ED',  _dark: '#111827' } },
        },
        border: {
          default: { value: { _light: '#E8E8E8',  _dark: '#4A5568' } },
        },
        fg: {
          default: { value: { _light: '#000000',  _dark: '#F7FAFC' } },
          muted:   { value: { _light: '#6B6B6B',  _dark: '#A0AEC0' } },
        },
      },
    },
  },
})

const system = createSystem(defaultConfig, config)

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  )
}
