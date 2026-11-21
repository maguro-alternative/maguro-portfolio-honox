import { test, expect } from './fixtures'

test('ガチャ: 10連を引くと結果が10件出る', async ({ page }) => {
  await page.goto('/gacha/dolphin')
  await page.getByRole('button', { name: '10連ガチャを引く' }).click()
  await expect(page.getByText('ガチャを引いた回数: 10')).toBeVisible()
  await expect(page.locator('.cacha_contents_wrapper ul > li')).toHaveCount(10)
})

for (const [path, title] of [
  ['/nine/dolphin', '私を構成する9人のドルフィン'],
  ['/nine/kagura', '私を構成する9人のシノビ少女'],
] as const) {
  test(`nine ${path}: ランダムで9人選んで画像を作れる`, async ({ page }) => {
    await page.goto(path)
    const generate = page.getByRole('button', { name: '画像を作成' })
    await expect(generate).toBeDisabled()

    await page.getByRole('button', { name: 'ランダム' }).click()
    await expect(page.getByText('9 / 9 キャラ選択済み')).toBeVisible()
    await generate.click()

    const image = page.getByRole('img', { name: title })
    await expect(image).toBeVisible({ timeout: 30_000 })
    await expect(image).toHaveAttribute('src', /^data:image\/png/)
  })
}

for (const [path, file, name] of [
  ['/talk/dolphin', 'dolphin-wave-talk.png', '小針'],
  ['/talk/shinomas', 'shinomas-talk.png', '飛鳥'],
] as const) {
  test(`トーク ${path}: 入力して画像を保存できる`, async ({ page }) => {
    await page.goto(path)
    const reset = page.getByRole('button', { name: 'リセット' })
    await expect(reset).toBeDisabled()

    await page.getByPlaceholder(name).fill('テスト')
    await page.locator('textarea').fill('セリフのテスト')
    await expect(reset).toBeEnabled()

    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: '画像を保存' }).click()
    expect((await download).suggestedFilename()).toBe(file)
  })
}
