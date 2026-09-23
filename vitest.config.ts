import { defineConfig } from 'vitest/config'
import resvgWasm from './vite-resvg-wasm-plugin'

// vite.config.ts とは分けている。あちらの既定ブランチは honox() と build() を積んでいて、
// テスト実行時に SSR エントリやデプロイ用の変換まで走ってしまうため。
export default defineConfig({
  // ogPng.ts が読む仮想モジュールだけは、テストでも解決できるようにしておく
  plugins: [resvgWasm()],
  test: {
    include: ['app/**/*.test.ts', 'eslint-rules/**/*.test.js'],
    environment: 'node',
  },
})
