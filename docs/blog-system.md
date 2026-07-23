# ブログシステム設計

## 概要

公開記事とプライベート記事の2系統を持つブログシステム。
プライベート記事は GitHub 上に存在せず、Cloudflare R2 のみに保存される。

## システム構成

```
[公開リポジトリ]                [プライベートリポジトリ]
  app/content/posts/              posts/
    public-post.md                  private-01.md
    tech-post.md                    private-02.md

         ↓ push                          ↓ push
    GitHub Actions ←────────────────────┘
         │
         ├─ wrangler deploy（Workers）
         └─ wrangler r2 object put（プライベート記事を R2 へ）

[Cloudflare Workers]
  /blog/*        → app/content/posts/ の MD を読む（公開）
  /private/*     → R2 から MD を読む（Basic 認証必須）
```

## ルート構成

| パス | 説明 | 認証 |
|------|------|------|
| `/blog` | 公開記事一覧 | なし |
| `/blog/:slug` | 公開記事詳細 | なし |
| `/private` | プライベート記事一覧 | Basic 認証 |
| `/private/:slug` | プライベート記事詳細 | Basic 認証 |

## プライベート記事のライフサイクル

1. プライベートリポジトリで `posts/` 以下に Markdown を書く
2. `main` ブランチへ push
3. GitHub Actions が起動
   - プライベートリポジトリを checkout
   - `wrangler r2 object put` で R2 にアップロード
4. `/private/:slug` にアクセスすると Workers が R2 から取得して描画

## R2 のキー設計

```
private-posts/{slug}.md
```

例: `private-posts/private-01.md`

## 認証方式

Hono の `basicAuth` ミドルウェアを使用。  
パスワードは Cloudflare Workers の Secret として管理（`PRIVATE_PASSWORD`）。  
ユーザー名は `admin` 固定。

## Markdown のレンダリング

- 公開記事: ビルド時に `@mdx-js/rollup` で処理
- プライベート記事: ランタイムで `marked` を使って HTML に変換

## GitHub Actions で必要な Secrets

| Secret 名 | 内容 |
|-----------|------|
| `PRIVATE_REPO_TOKEN` | プライベートリポジトリを読める GitHub PAT (read:contents) |
| `CLOUDFLARE_API_TOKEN` | `wrangler deploy` + `r2:write` 権限を持つ Cloudflare API トークン |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |
