import build from '@hono/vite-build/vercel'
import mdx from '@mdx-js/rollup'
import adapter from '@hono/vite-dev-server/node'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'
import nodeServerPlugin from './vite-node-server-plugin'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: {
          input: ['/app/client.ts', '/app/style.css'],
        },
        manifest: true,
        outDir: './dist/static',
      },
      plugins: [
        tailwindcss(),
        build({
          entry: './app/client.ts',
        }),
      ],
    }
  }

  return {
    plugins: [
      honox({
        client: {
          input: ['/app/client.ts'],
        },
      }),
      tailwindcss(),
      build({
        entry: './app/server.ts',
      })
    ],
  }
})
