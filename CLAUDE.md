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
- Islands（`app/islands/`）はクライアントサイドで動くコンポーネント。通常のコンポーネントと混在させない
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

- `app/islands/` 以外でクライアントサイドの状態管理をしない
- `wrangler.jsonc` に秘密情報を直接書かない（Secrets を使う）
- コードのコメントにはwhy notのみを書く。
