import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Whenever you fetch something starting with "/api"
      '/api': {
        target: 'http://localhost:5000', // Send it to the Node server
        changeOrigin: true,
      },
    },
  },
})