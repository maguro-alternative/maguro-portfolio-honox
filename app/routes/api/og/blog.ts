import { createRoute } from 'honox/factory'
import { buildOgSvg } from '../../../lib/og'

export default createRoute((c) => {
  const title = c.req.query('title') || 'ブログ'
  const date = c.req.query('date') || ''

  const svg = buildOgSvg({
    label: 'BLOG',
    title,
    date,
    gradFrom: '#0f172a',
    gradMid: '#1e3a5f',
    gradTo: '#0f172a',
    accent: '#60a5fa',
  })

  return c.body(svg, 200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=86400',
  })
})
