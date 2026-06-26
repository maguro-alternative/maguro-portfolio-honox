# maguro-portfolio-honox

maguro-alternative のポートフォリオサイト。HonoX + Cloudflare Workers で動作する。

## Tech Stack

- **Framework**: [HonoX](https://github.com/honojs/honox)
- **Runtime**: Cloudflare Workers
- **Styling**: Tailwind CSS v4
- **Storage**: Cloudflare R2（プライベートブログ記事）

## Commands

```sh
npm install       # 依存関係インストール
npm run dev       # 開発サーバー起動
npm run build     # ビルド
npm run deploy    # ビルド + Cloudflare Workers にデプロイ
npm run preview   # wrangler dev でローカルプレビュー
```

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
