import build from '@hono/vite-build/cloudflare-workers'
import adapter from '@hono/vite-dev-server/node'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
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
