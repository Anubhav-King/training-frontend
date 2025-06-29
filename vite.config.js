import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // ✅ Add this line
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['.replit.dev']
  }
})
