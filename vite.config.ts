import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  server: {
    proxy: {
      '/Cell': { target: 'https://localhost:7035', changeOrigin: true, secure: false },
      '/Sensor': { target: 'https://localhost:7035', changeOrigin: true, secure: false },
      '/Settings': { target: 'https://localhost:7035', changeOrigin: true, secure: false },
      '/Fired': { target: 'https://localhost:7035', changeOrigin: true, secure: false },
      '/ws': { target: 'https://localhost:7035', ws: true, changeOrigin: true, secure: false },
    },
    allowedHosts: ['.ngrok-free.app']
  },
})
