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
