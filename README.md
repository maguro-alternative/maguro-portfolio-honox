# maguro-portfolio-honox

maguro-alternative のポートフォリオサイト。HonoX 製で、Vercel と Cloudflare Workers の両方にデプロイできる。

## Tech Stack

- **Framework**: [HonoX](https://github.com/honojs/honox)
- **Runtime**: Vercel Functions（本番） / Cloudflare Workers
- **Styling**: Tailwind CSS v4
- **Storage**: Cloudflare R2（プライベートブログ記事）

## Commands

```sh
npm install        # 依存関係インストール
npm run dev        # 開発サーバー起動

npm run build      # Vercel 向けビルド
npm run deploy     # ビルド + Vercel にデプロイ

npm run build:cf   # Cloudflare Workers 向けビルド
npm run deploy:cf  # ビルド + wrangler deploy
npm run preview    # Cloudflare 向けビルド + wrangler dev でローカルプレビュー
```

デプロイ先は環境変数 `DEPLOY_TARGET` で切り替わる（未指定 = Vercel、`cloudflare` = Workers）。
クライアントビルドの成果物（`dist/`）は両者で共通。

## Blog System

公開記事とプライベート記事の2系統を持つ。

| 種別 | 保存場所 | アクセス |
|------|----------|----------|
| 公開記事 | `app/content/posts/` (このリポジトリ) | 誰でも閲覧可 |
| プライベート記事 | 別のプライベートリポジトリ → R2 | Basic認証が必要 |

詳細は [docs/blog-system.md](docs/blog-system.md) を参照。

## Cloudflare Secrets

デプロイ前に以下のシークレットを設定する。

```sh
wrangler secret put PRIVATE_PASSWORD
```

### 静的アセットの制約

Cloudflare Workers は 1ファイル 25MiB を超える静的アセットを配信できない。
`/snow` の背景は元々 77MB の gif だったが、この上限に引っかかるため mp4（`public/yumimahou.mp4`）+
poster 画像に置き換えてある。大きなメディアを追加する場合は同じ方針に従うこと。

## Directory Structure

```
app/
  content/posts/     # 公開ブログ記事 (Markdown)
  routes/
    blog/            # 公開ブログ
    private/         # プライベートブログ（Basic認証）
  components/        # 共通コンポーネント
  islands/           # クライアントサイドコンポーネント
.github/workflows/   # デプロイ自動化
docs/                # 設計ドキュメント・ADR
```
