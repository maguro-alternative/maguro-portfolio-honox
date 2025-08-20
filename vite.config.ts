// 再掲: これが最終的な推奨設定です
import vercel from '@hono/vite-build'
import honox from 'honox/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    honox({
      client: {
        input: [
          '/app/client.ts'
        ]
      }
    }),
    tailwindcss(),
    vercel({
      entry: './app/server.ts',
    })
  ]
})
