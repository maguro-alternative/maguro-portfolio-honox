import vercel from '@hono/vite-build'
import adapter from '@hono/vite-dev-server/node'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

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
      tailwindcss(),
      vercel({
        entry: ['./app/server.ts'],
        external: ['hono', 'hono/dev', 'hono/vite-build', 'honox/server'],
        minify: true,
        emptyOutDir: true,
      }),
    ],
  }
})
