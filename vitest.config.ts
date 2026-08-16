import { defineConfig } from 'vitest/config'

// vite.config.ts とは分けている。あちらの既定ブランチは honox() と build() を積んでいて、
// テスト実行時に SSR エントリやデプロイ用の変換まで走ってしまうため。
export default defineConfig({
  test: {
    include: ['app/**/*.test.ts', 'eslint-rules/**/*.test.js'],
    environment: 'node',
  },
})
