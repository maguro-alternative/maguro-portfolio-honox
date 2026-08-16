# CLAUDE.md

## プロジェクト概要

maguro-alternative のポートフォリオサイト。HonoX (Hono ベースの SSR フレームワーク) 製。デプロイ先は Vercel と Cloudflare Workers の2系統を維持している。

## Tech Stack

- **HonoX**: ファイルベースルーティング + JSX SSR
- **Vercel Functions / Cloudflare Workers**: デプロイ先（`DEPLOY_TARGET` で切り替え）
- **Cloudflare R2**: プライベートブログ記事のストレージ
- **Tailwind CSS v4**: スタイリング（vite プラグイン経由）
- **@mdx-js/rollup**: MDX サポート（ビルド時）

## コマンド

```sh
npm run dev        # 開発サーバー（Vite）
npm run check      # typecheck + lint + test（push 前にこれ）
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint（--fix は npm run lint:fix）
npm run test       # Vitest（--watch は npm run test:watch）
npm run build      # Vercel 向け 2段ビルド
npm run deploy     # ビルド後 vercel deploy --prod
npm run build:cf   # Cloudflare 向け 2段ビルド
npm run deploy:cf  # ビルド後 wrangler deploy
npm run preview    # Cloudflare 向けビルド + wrangler dev
```

## アーキテクチャの注意点

- `vite.config.ts` はクライアントビルドとサーバービルドを `mode` で分岐している
- サーバービルドのターゲットは `DEPLOY_TARGET` 環境変数で決まる（未指定 = `@hono/vite-build/vercel`、`cloudflare` = `@hono/vite-build/cloudflare-workers`）。クライアント成果物は共通で `dist/` に出す（honox が `/dist/.vite/manifest.json` を決め打ちで読むため、この出力先は変更しない）
- Cloudflare 版では `dist/` をそのまま静的アセットとして配信するので、Worker 本体（`dist/index.js`）と manifest は `build:cf` が生成する `dist/.assetsignore` で除外する
- ランタイム非依存を保つこと（`node:*` や `fs` を使わない。記事読み込みは `import.meta.glob`、外部取得は `fetch`）
- クライアントサイドのコードは2層に分ける。`app/islands/` はハイドレーション境界（= ルートから読む入口）で、島どうしで共有するフック・UI 部品は `app/features/<機能>/` に置く。共有部品を `app/islands/` に置くと、それ自体が別のハイドレーション境界になってしまう
- 依存の向きは `app/lib/` → `app/features/` → `app/islands/` の一方通行。逆流は ESLint が弾く
- 上記のルール（ランタイム非依存・フックの置き場所・依存の向き）は `eslint.config.js` で機械的に検査している。ルールを変えるときは設定も直す
- テストは対象ファイルの隣に `*.test.ts` で置く。設定は `vitest.config.ts`（`vite.config.ts` は honox と build プラグインを積んでいてテストに使えないので分けてある）
- `renderTalk.ts` / `renderShinomasTalk.ts` は、実測値を REF_W 基準の比率で持ち、`unit(W)` を掛けてキャンバス座標にする。**ローカル変数は必ず px 空間（`* u` 済み）に揃えること**。REF 空間のまま持ち回ると、離れた場所で掛け忘れ・二重掛けが起きる。例外は `r / BTN_R` のような px÷REF の無次元スケール係数
- 用途の違う string は `app/lib/brand.ts` のブランド型で区別する（`ProxiedUrl` / `SourceUrl` / `CharacterSlug` / `EmblemId` / `LogoId`）。値を作れるのは各モジュールの生成関数だけで、呼び出し側で `as` を書かない
- Cloudflare Bindings（R2 等）は `c.env` 経由でアクセスする。型は `wrangler types` で生成した `worker-configuration.d.ts` を使う

## ブログシステム

- 公開記事: `app/content/posts/*.md` に Markdown を置く
- プライベート記事: 別のプライベートリポジトリで管理 → GitHub Actions が R2 へアップロード → `/private/*` ルートで Basic 認証付きで配信
- 詳細は `docs/blog-system.md` を参照

## 環境変数 / シークレット

| 名前 | 用途 | 設定方法 |
|------|------|----------|
| `PRIVATE_PASSWORD` | プライベートブログの Basic 認証パスワード | `wrangler secret put PRIVATE_PASSWORD` |

## やってはいけないこと

- `app/islands/` と `app/features/` 以外でクライアントサイドの状態管理をしない
- `wrangler.jsonc` に秘密情報を直接書かない（Secrets を使う）
- コードのコメントにはwhy notのみを書く。
- Tailwind のクラス名を文字列結合で組み立てない（`bg-${color}-700` は v4 の JIT が拾えない）。可変にしたい場合は完全なクラス名を持つトークンを用意する（例: `app/features/talk/theme.ts`）
