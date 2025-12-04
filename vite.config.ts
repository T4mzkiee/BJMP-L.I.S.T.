import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase the chunk size limit to suppress warnings for large libraries like Recharts
    chunkSizeWarningLimit: 1600,
  },
})