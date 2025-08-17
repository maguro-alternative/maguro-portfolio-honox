import vercel from '@hono/vite-build'
import adapter from '@hono/vite-dev-server/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === "client") {
    return {
      build: {
        manifest: true,
        rollupOptions: {
          input: ["./app/style.css", "./app/client.ts"],
        },
      },
      plugins: [tailwindcss()],
    };
  }
  return {
    plugins: [
      honox({
        devServer: { adapter },
        client: { input: ['./app/style.css'] }
      }),
      tailwindcss(),
      vercel({})
    ]
  }
})
