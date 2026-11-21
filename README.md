# maguro-portfolio-honox

maguro-alternative のポートフォリオサイト。HonoX 製で、Vercel と Cloudflare Workers の両方にデプロイできる。

## Tech Stack

- **Framework**: [HonoX](https://github.com/honojs/honox)
- **Runtime**: Cloudflare Workers（本番、`maguro-alternative.com`） / Vercel Functions
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
npm run smoke -- <url> [manifest]  # デプロイ後の本番確認
npm run test:e2e   # Playwright の E2E（先に npm run build:cf）
```

デプロイ先は環境変数 `DEPLOY_TARGET` で切り替わる（未指定 = Vercel、`cloudflare` = Workers）。
クライアントビルドの成果物（`dist/`）は両者で共通。

## Deploy

**main への push で両方に自動デプロイされる。** PR ではデプロイされない（Vercel のプレビューだけ作られる）。

| 環境 | 仕組み | 備考 |
|------|--------|------|
| Cloudflare Workers | Workers Builds（Cloudflare の Git 連携） | 本番（`maguro-alternative.com`）。デプロイコマンド `npm run deploy:ci` が本番を確認し、失敗したら直前の版へ自動でロールバックする |
| Vercel | Vercel の Git 連携 | `*.vercel.app`。PR ごとにプレビューも作られる |

Workers Builds の設定（ビルドコマンド `npm run build:cf`、デプロイコマンド `npm run deploy:ci`、Node は `.node-version`）は Cloudflare のダッシュボード側にある。GitHub にデプロイ用のトークンは置かない。

### 依存の更新

Dependabot が PR を作る（バージョン更新は週1回、公開から3日以上経った版だけ。セキュリティ更新は随時）。パッチ・マイナーは CI が通れば自動で merge され、そのままデプロイされる。メジャーは自動 merge しないので、内容を見て merge する。

### 手動でデプロイする場合

`npm run deploy:cf`（Cloudflare）、`npm run deploy`（Vercel）。初回は `wrangler login` が必要。
Node は `engines` と `.npmrc` の `engine-strict=true` により 22.x に固定されているので、22 系で実行すること
（Vercel CLI は新しい Node だと依存の engine チェックで弾かれる）。

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
