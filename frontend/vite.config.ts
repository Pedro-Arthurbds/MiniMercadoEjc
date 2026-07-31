import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
      '/products': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
      '/sales': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
      '/commands': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
      '/command-items': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
      '/c': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
