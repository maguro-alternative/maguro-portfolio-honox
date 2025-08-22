import build from '@hono/vite-build/vercel'
import mdx from '@mdx-js/rollup'
import adapter from '@hono/vite-dev-server/node'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'
import nodeServerPlugin from './vite-node-server-plugin'
import vercel from 'vite-plugin-vercel';

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: {
          input: ['./app/client.ts', './app/style.css'],
        },
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
      vercel()
    ],
  }
})
