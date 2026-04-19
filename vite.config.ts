import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cmc-api': {
        target: 'https://pro-api.coinmarketcap.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/cmc-api/, ''),
      },
    },
  },
})
