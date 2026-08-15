import { createRoute } from 'honox/factory'
import { buildShinomasTalkOgSvg } from '../../../lib/og'

export default createRoute((c) => {
  const name = c.req.query('name') || ''
  const line1 = c.req.query('l1') || '好きな画像を、シノマスの'
  const line2 = c.req.query('l2') || '会話画面風に仕上げられます。'

  const svg = buildShinomasTalkOgSvg({
    title: c.req.query('title') || 'シノマス セリフメーカー',
    name,
    lines: [line1, line2].filter((l) => l !== ''),
    footer: 'マグロポートフォリオ',
  })

  return c.body(svg, 200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=86400',
  })
})
