import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Alias sin depender de tipos de Node: usamos URL base del archivo

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname
    }
  }
})
