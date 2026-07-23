import { createRoute } from 'honox/factory'

// 許可ドメインの画像のみを中継する（nine ツールの外部アイコン用）
const ALLOWED_DOMAINS = ['hpgames.jp', 'www.marv.jp', 'seesaawiki.jp']

export default createRoute(async (c) => {
  const imageUrl = c.req.query('url')

  if (!imageUrl) {
    return c.text('Missing url parameter', 400)
  }

  let url: URL
  try {
    url = new URL(decodeURIComponent(imageUrl))
  } catch {
    return c.text('Invalid url', 400)
  }

  if (!ALLOWED_DOMAINS.some((domain) => url.hostname.includes(domain))) {
    return c.text('Domain not allowed', 403)
  }

  try {
    const response = await fetch(url.toString())
    if (!response.ok) {
      return c.text('Failed to fetch image', response.status as 400)
    }

    const buffer = await response.arrayBuffer()
    return c.body(buffer, 200, {
      'Content-Type': response.headers.get('Content-Type') || 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    })
  } catch {
    return c.text('Failed to proxy image', 500)
  }
})
