import build from '@hono/vite-build/vercel'
import adapter from '@hono/vite-dev-server/node'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command, mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: {
          input: ['./app/client.ts', './app/style.css'],
        },
        cssCodeSplit: true,
        manifest: true,
      },
      plugins: [
        tailwindcss(),
      ],
    }
  }

  return {
    // dev SSR では highlight.js を Node 側で解決させる（CJS の require を避ける）。
    // 本番ビルドは従来どおりバンドルに含める。
    ssr: command === 'serve' ? { external: ['highlight.js'] } : undefined,
    plugins: [
      honox({
        devServer: { adapter },
        client: { input: ['./app/style.css'] }
      }),
      tailwindcss(),
      build(),
    ],
  }
})
