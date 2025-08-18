import vercel from '@hono/vite-build'
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
          manifest: true,
        },
        outDir: './dist/static',
      },
      plugins: [tailwindcss()],
    }
  }

  return {
    plugins: [
      honox({
        devServer: {
          adapter,
        },
      }),
      nodeServerPlugin(),
      tailwindcss(),
    ],
  }
})
