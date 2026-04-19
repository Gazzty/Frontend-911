import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          orange: { value: '#FF4500' },
          beige: { value: '#F5F1ED' },
          black: { value: '#000000' },
          white: { value: '#FFFFFF' },
        },
        gray: {
          50: { value: '#FAFAFA' },
          100: { value: '#F7F7F7' },
          200: { value: '#E8E8E8' },
          300: { value: '#D1D1D1' },
          500: { value: '#6B6B6B' },
          700: { value: '#2D2D2D' },
        },
        green: {
          400: { value: '#51CF66' },
        },
        red: {
          400: { value: '#FF6B6B' },
          500: { value: '#FF4500' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);