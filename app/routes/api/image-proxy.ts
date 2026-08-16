import { createRoute } from 'honox/factory'
import { parseProxyTarget } from '../../lib/imageProxy'
import { logFailure } from '../../lib/logFailure'

// 許可ドメインの画像のみを中継する（nine ツールの外部アイコン用）
export default createRoute(async (c) => {
  const raw = c.req.query('url')
  if (!raw) {
    return c.text('Missing url parameter', 400)
  }

  const url = parseProxyTarget(decodeURIComponent(raw))
  if (!url) {
    return c.text('URL not allowed', 400)
  }

  let response: Response
  try {
    response = await fetch(url.toString())
  } catch (error) {
    logFailure('image-proxy/fetch', error, { url: url.toString() })
    return c.text('Failed to reach upstream', 502)
  }

  if (!response.ok) {
    logFailure('image-proxy/upstream', `HTTP ${response.status}`, { url: url.toString() })
    return c.text('Upstream returned an error', 502)
  }

  try {
    const buffer = await response.arrayBuffer()
    return c.body(buffer, 200, {
      'Content-Type': response.headers.get('Content-Type') || 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    })
  } catch (error) {
    logFailure('image-proxy/body', error, { url: url.toString() })
    return c.text('Failed to read upstream body', 502)
  }
})
