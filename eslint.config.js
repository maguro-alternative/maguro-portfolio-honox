import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import noDynamicTailwindClass from './eslint-rules/no-dynamic-tailwind-class.js'

// Cloudflare Workers と Vercel Functions の両方で動かすため、Node 組み込みは使えない。
// 記事読み込みは import.meta.glob、外部取得は fetch を使うこと。
const NODE_BUILTINS = [
  'fs',
  'fs/promises',
  'path',
  'os',
  'crypto',
  'child_process',
  'stream',
  'util',
  'http',
  'https',
]

const RUNTIME_MESSAGE =
  'Cloudflare Workers で動かないため使用不可。ファイルは import.meta.glob、外部取得は fetch を使う。'

const HOOKS = [
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useRef',
  'useMemo',
  'useCallback',
  'useReducer',
]

const HOOKS_MESSAGE =
  'クライアントの状態は app/islands/ か app/features/ に置く。' +
  '（app/islands/ 直下はハイドレーション境界になるので、共有ロジックは app/features/ 側）'

/**
 * no-restricted-imports はキーごとに後勝ちで上書きされるので、
 * ディレクトリ別の設定でも毎回フルセットを組み立て直す。
 */
function restrictedImports({ allowHooks = false, forbid = [] } = {}) {
  return [
    'error',
    {
      paths: [
        ...NODE_BUILTINS.map((name) => ({ name, message: RUNTIME_MESSAGE })),
        ...(allowHooks
          ? []
          : [{ name: 'hono/jsx', importNames: HOOKS, message: HOOKS_MESSAGE }]),
      ],
      patterns: [
        { group: ['node:*'], message: RUNTIME_MESSAGE },
        ...forbid,
      ],
    },
  ]
}

export default tseslint.config(
  {
    ignores: ['dist/**', '.vercel/**', '.wrangler/**', 'worker-configuration.d.ts'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // 使い捨ての受け口として _ 始まりを許す。
      // catch も同じ扱いにして、意図的に握りつぶす箇所を `catch (_e)` で grep できるようにする。
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'CatchClause:not([param])',
          message:
            'エラー値を捨てると、どの失敗か後から判別できない。catch (error) で受けて logFailure() に渡すこと。本当に無視してよいなら catch (_error) と書く。',
        },
      ],
    },
  },

  // --- app/ 全体：ランタイム非依存 + フックの置き場所 ---
  {
    files: ['app/**/*.{ts,tsx}'],
    plugins: {
      local: { rules: { 'no-dynamic-tailwind-class': noDynamicTailwindClass } },
    },
    rules: {
      'no-restricted-imports': restrictedImports(),
      'local/no-dynamic-tailwind-class': 'error',
    },
  },

  // --- app/lib/：描画とデータの純ロジック。UI 層に依存させない ---
  {
    files: ['app/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports({
        forbid: [
          {
            group: ['**/islands/**', '**/features/**'],
            message: 'app/lib/ は UI に依存しない。依存の向きは lib → features → islands の一方通行。',
          },
        ],
      }),
    },
  },

  // --- app/islands/ と app/features/：クライアント状態を持ってよい ---
  {
    files: ['app/islands/**/*.{ts,tsx}', 'app/features/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': restrictedImports({ allowHooks: true }) },
  },

  // --- app/features/：islands から使われる側。逆流させない ---
  {
    files: ['app/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictedImports({
        allowHooks: true,
        forbid: [
          {
            group: ['**/islands/**'],
            message:
              'app/features/ は island から import される側。逆向きの依存は循環になる。',
          },
        ],
      }),
    },
  },

  // --- 型定義とビルド設定は Node 前提 ---
  {
    files: ['**/*.d.ts', 'vite.config.ts', 'scripts/**', '*.config.{js,ts}'],
    rules: {
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  }
)
