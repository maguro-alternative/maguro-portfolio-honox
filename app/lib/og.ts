// OG 画像を依存ゼロの SVG で生成する。
// 注: @vercel/og(satori) による PNG 生成は wasm が単一バンドル構成と
// 非互換のため見送り、デプロイ先確定時（Cloudflare/satori 系）に再検討する。

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// タイトルを概ね maxChars ごとに改行（全角想定の簡易折り返し）
function wrapTitle(title: string, maxChars: number, maxLines: number): string[] {
  const lines: string[] = []
  let rest = title
  while (rest.length > 0 && lines.length < maxLines) {
    if (rest.length <= maxChars) {
      lines.push(rest)
      rest = ''
    } else if (lines.length === maxLines - 1) {
      lines.push(rest.slice(0, maxChars - 1) + '…')
      rest = ''
    } else {
      lines.push(rest.slice(0, maxChars))
      rest = rest.slice(maxChars)
    }
  }
  return lines
}

type OgOptions = {
  label: string
  title: string
  date?: string
  gradFrom: string
  gradMid: string
  gradTo: string
  accent: string
}

export function buildOgSvg({
  label,
  title,
  date,
  gradFrom,
  gradMid,
  gradTo,
  accent,
}: OgOptions): string {
  const fontSize = title.length > 30 ? 44 : 56
  const maxChars = title.length > 30 ? 22 : 18
  const lines = wrapTitle(title, maxChars, 3)
  const lineHeight = fontSize * 1.3
  const titleBlockHeight = lines.length * lineHeight
  const titleStartY = 315 - titleBlockHeight / 2 + fontSize / 2

  const titleTspans = lines
    .map(
      (line, i) =>
        `<tspan x="600" y="${titleStartY + i * lineHeight}">${escapeXml(
          line
        )}</tspan>`
    )
    .join('')

  const dateText = date
    ? `<text x="600" y="${
        titleStartY + titleBlockHeight + 20
      }" text-anchor="middle" font-size="22" fill="rgba(255,255,255,0.5)">${escapeXml(
        date
      )}</text>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradFrom}" />
      <stop offset="50%" stop-color="${gradMid}" />
      <stop offset="100%" stop-color="${gradTo}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="60" y="115" width="1080" height="400" rx="24" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
  <text x="600" y="200" text-anchor="middle" font-size="18" letter-spacing="4" fill="${accent}" font-family="sans-serif">${escapeXml(
    label
  )}</text>
  <text text-anchor="middle" font-size="${fontSize}" font-weight="bold" fill="#ffffff" font-family="sans-serif">${titleTspans}</text>
  ${dateText}
  <text x="600" y="590" text-anchor="middle" font-size="20" fill="rgba(255,255,255,0.7)" font-family="sans-serif">マグロポートフォリオ</text>
</svg>
`
}

// ===== nine（9キャラ選択）用 OG =====
export type NineOgCharacter = { name: string; imageUrl: string }

type NineOgOptions = {
  title: string
  characters: NineOgCharacter[] // 長さ9
  gradFrom: string
  gradTo: string
  cellFill: string
  cellStroke: string
  nameColor: string
  footer: string
}

export function buildNineOgSvg({
  title,
  characters,
  gradFrom,
  gradTo,
  cellFill,
  cellStroke,
  nameColor,
  footer,
}: NineOgOptions): string {
  const hasAny = characters.some((c) => c.name !== '')
  const cellW = 320
  const cellH = 110
  const gapX = 12
  const gapY = 10
  const gridX0 = 108
  const gridY0 = 200

  const shortName = (n: string) => (n.length > 8 ? n.slice(0, 7) + '…' : n)

  const cells = characters
    .map((ch, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = gridX0 + col * (cellW + gapX)
      const y = gridY0 + row * (cellH + gapY)
      const cx = x + cellW / 2
      const selected = ch.name !== ''
      const bg = `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="12" fill="${
        selected ? cellFill : '#f8fafc'
      }" stroke="${selected ? cellStroke : '#cbd5e1'}" stroke-width="2"${
        selected ? '' : ' stroke-dasharray="6 4"'
      } />`

      if (ch.imageUrl) {
        const img = `<image href="${escapeXml(
          ch.imageUrl
        )}" x="${cx - 34}" y="${y + 6}" width="68" height="68" preserveAspectRatio="xMidYMid meet" />`
        const name = `<text x="${cx}" y="${
          y + 96
        }" text-anchor="middle" font-size="15" font-weight="bold" fill="${nameColor}" font-family="sans-serif">${escapeXml(
          shortName(ch.name)
        )}</text>`
        return bg + img + name
      }

      const label = `<text x="${cx}" y="${
        y + cellH / 2 + 7
      }" text-anchor="middle" font-size="${
        selected ? 20 : 18
      }" ${selected ? 'font-weight="bold"' : ''} fill="${
        selected ? nameColor : '#94a3b8'
      }" font-family="sans-serif">${escapeXml(selected ? shortName(ch.name) : '?')}</text>`
      return bg + label
    })
    .join('\n  ')

  const emptyMsg = hasAny
    ? ''
    : `<text x="600" y="330" text-anchor="middle" font-size="22" fill="#64748b" font-family="sans-serif">9人のキャラクターを選んで画像として保存</text>`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradFrom}" />
      <stop offset="100%" stop-color="${gradTo}" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="60" y="60" width="1080" height="510" rx="24" fill="#ffffff" />
  <text x="600" y="140" text-anchor="middle" font-size="40" font-weight="bold" fill="#1e293b" font-family="sans-serif">${escapeXml(
    title
  )}</text>
  ${hasAny ? cells : emptyMsg}
  <text x="600" y="600" text-anchor="middle" font-size="20" fill="rgba(255,255,255,0.95)" font-family="sans-serif">${escapeXml(
    footer
  )}</text>
</svg>
`
}
