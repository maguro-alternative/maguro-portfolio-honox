# CLAUDE.md

## プロジェクト概要

maguro-alternative のポートフォリオサイト。HonoX (Hono ベースの SSR フレームワーク) + Cloudflare Workers 構成。

## Tech Stack

- **HonoX**: ファイルベースルーティング + JSX SSR
- **Cloudflare Workers**: エッジランタイム
- **Cloudflare R2**: プライベートブログ記事のストレージ
- **Tailwind CSS v4**: スタイリング（vite プラグイン経由）
- **@mdx-js/rollup**: MDX サポート（ビルド時）

## コマンド

```sh
npm run dev      # 開発サーバー（Vite）
npm run build    # クライアント + サーバーの2段ビルド
npm run deploy   # ビルド後 wrangler deploy
npm run preview  # wrangler dev でローカル Workers 動作確認
```

## アーキテクチャの注意点

- `vite.config.ts` はクライアントビルドとサーバービルドを `mode` で分岐している
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
