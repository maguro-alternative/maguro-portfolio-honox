import { test as base, expect } from '@playwright/test'

const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
)

// 外部サイトの画像（キャラのアイコンなど）は差し替える。相手側の障害や
// レート制限でテストが落ちると、依存更新の自動 merge が止まってしまうため
const isExternalImage = (url: URL) =>
  url.pathname.startsWith('/api/image-proxy') ||
  (url.hostname !== 'localhost' && /\.(png|jpe?g|webp|gif)$/i.test(url.pathname))

// 全テストで、捕捉されない例外が出たら失敗にする。ハイドレーションが壊れたときに
// 画面の見た目は保たれたまま操作だけ効かなくなるのを、個々のテストの書き漏れなく拾うため
export const test = base.extend<{ pageErrors: Error[] }>({
  pageErrors: [async ({ page }, use) => {
    const errors: Error[] = []
    page.on('pageerror', (error) => errors.push(error))
    await page.route(isExternalImage, (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL_PNG })
    )
    // YouTube などの外部 iframe は読み込まない。通信が止まらず、相手側の都合でも落ちるため
    await page.route(
      (url) => url.hostname !== 'localhost',
      (route) => (route.request().resourceType() === 'document' ? route.abort() : route.fallback())
    )
    await use(errors)
    expect(errors, 'ページで捕捉されない例外が出た').toEqual([])
  }, { auto: true }],
})

export { expect }
