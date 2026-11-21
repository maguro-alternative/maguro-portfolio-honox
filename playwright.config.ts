import { defineConfig, devices } from '@playwright/test'

// 本番と同じ Cloudflare 向けの成果物を相手にする。vite の開発サーバーだと、
// ビルドでしか起きない壊れ方（バンドル・manifest・アセット配信）を見逃すため。
// 事前に npm run build:cf が要る。
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:8787',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx wrangler dev --port 8787',
    url: 'http://localhost:8787',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
