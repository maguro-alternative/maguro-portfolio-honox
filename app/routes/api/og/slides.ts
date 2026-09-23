import { createRoute } from 'honox/factory'
import { buildOgSvg } from '../../../lib/og'
import { ogImageResponse } from '../../../lib/ogPng'

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

  return ogImageResponse(svg)
})
