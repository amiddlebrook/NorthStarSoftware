import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This matches your GitHub repository name
  base: '/',
  build: {
    outDir: 'docs',
  }
})