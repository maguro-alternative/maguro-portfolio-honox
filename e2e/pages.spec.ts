import { test, expect } from './fixtures'

const PAGES = [
  '/',
  '/blog/hello-world',
  '/slides',
  '/slides/sample',
  '/articles',
  '/profile',
  '/talk/dolphin',
  '/talk/shinomas',
  '/nine/dolphin',
  '/nine/kagura',
  '/gacha/dolphin',
  '/snow',
  '/yumi',
]

for (const path of PAGES) {
  test(`${path} を開いても例外が出ない`, async ({ page }) => {
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    // 島ごとの JS は load の後に読み込まれることがあるので、ハイドレーションが終わるまで少し待つ
    await page.waitForTimeout(1000)
  })
}
