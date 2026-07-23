import { createRoute } from 'honox/factory'
import { buildNineOgSvg, type NineOgCharacter } from '../../../lib/og'
import { kaguraCharacters } from '../../../lib/nine/kaguraCharacters'

export default createRoute((c) => {
  const title = c.req.query('title') || '私を構成する9人のシノビ少女'

  const characters: NineOgCharacter[] = []
  const cParam = c.req.query('c')

  if (cParam) {
    // c=idx-idx-... のインデックス指定
    const parts = cParam.split('-')
    for (let i = 0; i < 9; i++) {
      const raw = parts[i]
      const idx = raw !== undefined && raw !== '' ? parseInt(raw, 10) : NaN
      if (!isNaN(idx) && idx >= 0 && idx < kaguraCharacters.length) {
        const ch = kaguraCharacters[idx]
        characters.push({ name: ch.name, imageUrl: ch.imageUrl })
      } else {
        characters.push({ name: '', imageUrl: '' })
      }
    }
  } else {
    // s1..s9 の slug 指定
    for (let i = 1; i <= 9; i++) {
      const slug = c.req.query(`s${i}`)
      const ch = slug ? kaguraCharacters.find((x) => x.slug === slug) : undefined
      characters.push(
        ch ? { name: ch.name, imageUrl: ch.imageUrl } : { name: '', imageUrl: '' }
      )
    }
  }

  const svg = buildNineOgSvg({
    title,
    characters,
    gradFrom: '#f472b6',
    gradTo: '#c084fc',
    cellFill: '#fdf2f8',
    cellStroke: '#f472b6',
    nameColor: '#9d174d',
    footer: '🌸 閃乱カグラ',
  })

  return c.body(svg, 200, {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=86400',
  })
})
