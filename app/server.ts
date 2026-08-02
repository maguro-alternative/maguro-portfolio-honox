import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'

const app = createApp({
  // www は apex へ 301 で寄せる（Vercel 時代の挙動を維持）。
  // routes/_middleware.ts はそのディレクトリ直下にしか効かないため、
  // 全ルートに適用するにはルート登録前の init で差し込む必要がある。
  init: (app) => {
    app.use(async (c, next) => {
      const url = new URL(c.req.url)
      if (url.hostname.startsWith('www.')) {
        url.hostname = url.hostname.slice(4)
        return c.redirect(url.toString(), 301)
      }
      await next()
    })
  },
})

showRoutes(app)

export default app
