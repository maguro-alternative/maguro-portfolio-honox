import { createRoute } from 'honox/factory'
import { buildOgSvg } from '../../../lib/og'

export default createRoute((c) => {
  const title = c.req.query('title') || 'スライド'
  const date = c.req.query('date') || ''

  const svg = buildOgSvg({
    label: 'SLIDES',
    title,
    date,
    gradFrom: '#1a0533',
    gradMid: '#4a1d8e',
    gradTo: '#1a0533',
    accent: '#c084fc',
  })

  return c.body(svg, 200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=86400',
  })
})
