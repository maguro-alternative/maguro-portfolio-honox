import buildCloudflare from '@hono/vite-build/cloudflare-workers'
import buildVercel from '@hono/vite-build/vercel'
import adapter from '@hono/vite-dev-server/node'
import tailwindcss from '@tailwindcss/vite'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

// デプロイ先は DEPLOY_TARGET で切り替える（未指定なら従来どおり Vercel）。
// client ビルドの成果物（dist/）は両者で共通。
const build =
  process.env.DEPLOY_TARGET === 'cloudflare' ? buildCloudflare : buildVercel

export default defineConfig(({ command, mode }) => {
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
    // dev SSR では highlight.js を Node 側で解決させる（CJS の require を避ける）。
    // 本番ビルドは従来どおりバンドルに含める。
    ssr: command === 'serve' ? { external: ['highlight.js'] } : undefined,
    plugins: [
      honox({
        devServer: { adapter },
      }),
      tailwindcss(),
      build(),
    ],
  }
})
