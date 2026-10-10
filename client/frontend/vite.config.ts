import path from 'path'
import react from '@vitejs/plugin-react'
import tailwind from "@tailwindcss/vite"
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwind()],
  // .env lives in client/, one level above the Vite root
  envDir: '..',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@blockchain': path.resolve(__dirname, '../blockchain'),
    },
  },
})
