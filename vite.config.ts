import vercel from '@hono/vite-build'
import honox from 'honox/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    honox(),
    tailwindcss(),
    vercel({})
  ]
})
