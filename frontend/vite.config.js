import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    // Base URL berbeda untuk dev dan production
    base: mode === 'production' ? '/mis-arruhama/' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets'
    }
  }
})
