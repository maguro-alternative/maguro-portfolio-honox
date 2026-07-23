import { createRoute } from 'honox/factory'
import { buildNineOgSvg, type NineOgCharacter } from '../../../lib/og'
import { dolphinCharacters } from '../../../lib/nine/dolphinCharacters'

export default createRoute((c) => {
  const title = c.req.query('title') || '私を構成する9人のドルフィン'

  const characters: NineOgCharacter[] = []
  for (let i = 1; i <= 9; i++) {
    const slug = c.req.query(`s${i}`)
    const ch = slug ? dolphinCharacters.find((x) => x.slug === slug) : undefined
    characters.push(
      ch ? { name: ch.name, imageUrl: ch.imageUrl } : { name: '', imageUrl: '' }
    )
  }

  const svg = buildNineOgSvg({
    title,
    characters,
    gradFrom: '#667eea',
    gradTo: '#764ba2',
    cellFill: '#eef2ff',
    cellStroke: '#818cf8',
    nameColor: '#3730a3',
    footer: '🐬 ドルフィンウェーブ',
  })

  return c.body(svg, 200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=86400',
  })
})
