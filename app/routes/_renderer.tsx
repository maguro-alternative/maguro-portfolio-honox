import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, Script } from 'honox/server'

type RendererProps = {
  children?: unknown
  title?: string
  description?: string
  ogImage?: string
  ogType?: string
}

export default jsxRenderer(({ children, title, description, ogImage, ogType }: RendererProps, c) => {
  const fullTitle = title ?? 'マグロポートフォリオ'
  const desc = description ?? 'マグロのポートフォリオサイトです。'
  // OGP クローラは相対パスを解決しないものが多いため、リクエスト URL を基準に絶対 URL 化する。
  // 既に絶対 URL の場合はそのまま使われる。
  const ogImageUrl = ogImage ? new URL(ogImage, c.req.url).toString() : undefined

  return (
    <html lang="ja">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{fullTitle}</title>
        <meta name="description" content={desc} />
        <link rel="icon" href="/uchuemon.png" />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={desc} />
        <meta property="og:type" content={ogType ?? 'website'} />
        <meta property="og:site_name" content="マグロポートフォリオ" />
        <meta property="og:locale" content="ja_JP" />
        {ogImageUrl ? <meta property="og:image" content={ogImageUrl} /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        {ogImageUrl ? <meta name="twitter:image" content={ogImageUrl} /> : null}
        <Link href="/app/style.css" rel="stylesheet" />
        <Script src="/app/client.ts" async />
      </head>
      <body>{children}</body>
    </html>
  )
})
