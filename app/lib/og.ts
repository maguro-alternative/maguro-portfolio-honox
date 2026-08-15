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

// ===== talk（セリフメーカー）用 OG =====
// 会話画面そのものを縮小して描く。寸法は renderTalk.ts と同じ実測値（描画領域 2463 幅基準）を
// 1200x630 にスケールしたもの。あちらは Canvas 用なので、ここでは同じ数値を SVG で引き直している。

const TALK_OG_W = 1200
const TALK_OG_H = 630
const TALK_REF_W = 2463

type TalkOgOptions = {
  title: string
  name: string
  lines: string[]
  footer: string
}

export function buildTalkOgSvg({ title, name, lines, footer }: TalkOgOptions): string {
  const u = TALK_OG_W / TALK_REF_W
  const px = (v: number) => +(v * u).toFixed(2)

  // --- 上部ボタン（外径 60、青リングは半径 53・太さ 5）---
  const btnR = px(60)
  const btnCy = px(87)
  const ringR = px(53)
  const ringW = px(5)
  const btnCx = [103, 246, 389].map(px)
  const skipCx = TALK_OG_W - px(103)

  const circle = (cx: number) =>
    `<circle cx="${cx}" cy="${btnCy}" r="${btnR}" fill="#ffffff" />` +
    `<circle cx="${cx}" cy="${btnCy}" r="${ringR}" fill="none" stroke="#4d95f6" stroke-width="${ringW}" />`

  // アイコンは縮小表示なので、輪郭が分かる程度に簡略化している
  const icons =
    circle(btnCx[0]) +
    `<rect x="${btnCx[0] - px(33)}" y="${btnCy - px(20)}" width="${px(66)}" height="${px(
      42
    )}" rx="${px(8)}" fill="none" stroke="#5d84bb" stroke-width="${px(6)}" />` +
    [-1, 0, 1]
      .map(
        (i) =>
          `<circle cx="${btnCx[0] + px(13 * i)}" cy="${btnCy}" r="${px(4)}" fill="#5d84bb" />`
      )
      .join('') +
    circle(btnCx[1]) +
    `<text x="${btnCx[1]}" y="${btnCy + px(12)}" text-anchor="middle" font-size="${px(
      30
    )}" font-weight="bold" fill="#5d84bb" font-family="sans-serif">AUTO</text>` +
    circle(btnCx[2]) +
    `<rect x="${btnCx[2] - px(31)}" y="${btnCy - px(20)}" width="${px(68)}" height="${px(
      19
    )}" fill="#5d84bb" />` +
    `<rect x="${btnCx[2] - px(35)}" y="${btnCy + px(3)}" width="${px(68)}" height="${px(
      19
    )}" fill="#5d84bb" />` +
    `<line x1="${btnCx[2] - px(31)}" y1="${btnCy + px(33)}" x2="${btnCx[2] + px(
      34
    )}" y2="${btnCy - px(31)}" stroke="#ffffff" stroke-width="${px(20)}" />` +
    `<line x1="${btnCx[2] - px(31)}" y1="${btnCy + px(33)}" x2="${btnCx[2] + px(
      34
    )}" y2="${btnCy - px(31)}" stroke="#5d84bb" stroke-width="${px(7)}" />` +
    circle(skipCx) +
    `<path d="M ${skipCx - px(21)} ${btnCy - px(24)} L ${skipCx - px(3)} ${
      btnCy - px(24)
    } L ${skipCx + px(23)} ${btnCy + px(2)} L ${skipCx + px(5)} ${btnCy + px(2)} Z" fill="#5d84bb" />` +
    `<path d="M ${skipCx + px(5)} ${btnCy + px(2)} L ${skipCx + px(23)} ${btnCy + px(2)} L ${
      skipCx - px(3)
    } ${btnCy + px(28)} L ${skipCx - px(21)} ${btnCy + px(28)} Z" fill="#5d84bb" />` +
    `<rect x="${skipCx + px(20.5)}" y="${btnCy - px(24.5)}" width="${px(4)}" height="${px(
      53
    )}" fill="#5d84bb" />`

  // --- ネームプレート（下辺が左へ 6 ずれた平行四辺形 + 右端の階段）---
  const plateX = px(390)
  const plateY = TALK_OG_H - px(346)
  const plateH = px(66)
  const shear = px(6)
  const solidW = px(435)
  const rowH = plateH / 3
  const corner = (lx: number, ly: number) =>
    `${(plateX + lx - (shear * ly) / plateH).toFixed(2)},${(plateY + ly).toFixed(2)}`

  const tail = [
    { row: 0, from: 27, to: 115 },
    { row: 1, from: 0, to: 46 },
    { row: 1, from: 73, to: 91 },
    { row: 2, from: 0, to: 23 },
    { row: 2, from: 51, to: 69 },
  ]
    .map(({ row, from, to }) => {
      const top = row * rowH
      const bottom = (row + 1) * rowH
      const a = solidW + px(from)
      const b = solidW + px(to)
      return `<polygon points="${corner(a, top)} ${corner(b, top)} ${corner(
        b,
        bottom
      )} ${corner(a, bottom)}" fill="#ffffff" />`
    })
    .join('')

  const plate =
    `<polygon points="${corner(0, 0)} ${corner(solidW, 0)} ${corner(
      solidW,
      plateH
    )} ${corner(0, plateH)}" fill="#ffffff" />` +
    tail +
    `<text x="${plateX + px(14)}" y="${plateY + px(48)}" font-size="${px(
      47
    )}" font-weight="bold" fill="#163b69" font-family="sans-serif">${escapeXml(name)}</text>`

  // --- セリフ（1 行目を固定して下へ伸ばす）---
  const textX = px(565)
  const fontSize = px(54)
  const lineHeight = px(68)
  const firstBaseline = TALK_OG_H - px(205)
  const dialogue = lines
    .slice(0, 3)
    .map(
      (line, i) =>
        `<text x="${textX}" y="${(firstBaseline + i * lineHeight).toFixed(
          2
        )}" font-size="${fontSize}" font-weight="bold" fill="#ffffff" stroke="#000000" stroke-width="${px(
          9
        )}" stroke-linejoin="round" paint-order="stroke fill" font-family="sans-serif">${escapeXml(
          line
        )}</text>`
    )
    .join('')

  // --- タイトル（全角 1em / 半角 0.5em で概算して横幅に収める）---
  const titleEm = [...title].reduce(
    (n, ch) => n + (/[\x20-\x7e｡-ﾟ]/.test(ch) ? 0.5 : 1),
    0
  )
  const titleSize = Math.min(72, Math.floor(1020 / Math.max(titleEm, 1)))

  // --- 送りマーク ---
  const nx = px(1954)
  const ny = TALK_OG_H - px(90)
  const next = `<polygon points="${nx - px(21)},${ny - px(12)} ${nx + px(21)},${
    ny - px(12)
  } ${nx},${ny + px(12)}" fill="#ffffff" stroke="#0b1226" stroke-width="${px(
    11
  )}" stroke-linejoin="round" paint-order="stroke fill" />`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${TALK_OG_W}" height="${TALK_OG_H}" viewBox="0 0 ${TALK_OG_W} ${TALK_OG_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5fa8e0" />
      <stop offset="60%" stop-color="#8ec5e8" />
      <stop offset="100%" stop-color="#bfe0f2" />
    </linearGradient>
  </defs>
  <rect width="${TALK_OG_W}" height="${TALK_OG_H}" fill="url(#sky)" />
  ${icons}
  <text x="${TALK_OG_W / 2}" y="245" text-anchor="middle" font-size="${titleSize}" font-weight="bold" fill="#ffffff" stroke="#0b1226" stroke-width="${
    titleSize / 6
  }" stroke-linejoin="round" paint-order="stroke fill" font-family="sans-serif">${escapeXml(
    title
  )}</text>
  ${plate}
  ${dialogue}
  ${next}
  <text x="${px(103)}" y="${TALK_OG_H - px(40)}" font-size="${px(
    34
  )}" fill="rgba(255,255,255,0.75)" font-family="sans-serif">${escapeXml(footer)}</text>
</svg>
`
}

// ===== shinomas talk（シノマス セリフメーカー）用 OG =====
// 実機の寸法（1920 幅基準）を 1200x630 にスケールして SVG で引き直したもの。
// 会話ウィンドウのテクスチャ（流水紋）は埋め込めないので、
// 特徴になっている上端の白線とその両端のフェードだけをグラデーションで再現している。

const SHINOMAS_OG_W = 1200
const SHINOMAS_OG_H = 630
const SHINOMAS_REF_W = 1920

type ShinomasTalkOgOptions = {
  title: string
  name: string
  lines: string[]
  footer: string
}

export function buildShinomasTalkOgSvg({
  title,
  name,
  lines,
  footer,
}: ShinomasTalkOgOptions): string {
  const u = SHINOMAS_OG_W / SHINOMAS_REF_W
  const px = (v: number) => +(v * u).toFixed(2)
  const fromBottom = (v: number) => +(SHINOMAS_OG_H - v * u).toFixed(2)

  // --- 上部ボタン（120x120 の円。アイコンは縮小表示なので簡略化）---
  const btnR = px(52)
  const btnCy = px(70)
  const logCx = px(110)
  const skipCx = SHINOMAS_OG_W - px(110)
  const ring = (cx: number) =>
    `<circle cx="${cx}" cy="${btnCy}" r="${btnR}" fill="rgba(0,0,0,0.55)" stroke="#ffffff" stroke-width="${px(
      7
    )}" />`
  const chevron = (cx: number, dx: number) =>
    `<path d="M ${cx + dx - px(14)} ${btnCy - px(20)} L ${cx + dx + px(6)} ${btnCy} L ${
      cx + dx - px(14)
    } ${btnCy + px(20)}" fill="none" stroke="#ffffff" stroke-width="${px(
      13
    )}" stroke-linejoin="miter" stroke-linecap="butt" />`
  const buttons =
    ring(logCx) +
    `<rect x="${logCx - px(30)}" y="${btnCy - px(24)}" width="${px(60)}" height="${px(
      44
    )}" rx="${px(10)}" fill="none" stroke="#ffffff" stroke-width="${px(8)}" />` +
    `<path d="M ${logCx - px(14)} ${btnCy + px(18)} L ${logCx - px(4)} ${btnCy + px(
      34
    )} L ${logCx + px(4)} ${btnCy + px(18)} Z" fill="#ffffff" />` +
    [-1, 0, 1]
      .map(
        (i) => `<circle cx="${logCx + px(15 * i)}" cy="${btnCy - px(2)}" r="${px(5)}" fill="#ffffff" />`
      )
      .join('') +
    ring(skipCx) +
    chevron(skipCx, -px(9)) +
    chevron(skipCx, px(13))

  // --- 会話ウィンドウ（上端の白線 + 下へ落ちる黒。左右端はフェード）---
  const winY = fromBottom(216)
  const winH = px(192)
  const lineY = fromBottom(203) // 白線は素材の上から 10px
  const winX = px(181)
  const winW = SHINOMAS_OG_W - winX * 2
  const win =
    `<rect x="${winX}" y="${winY}" width="${winW}" height="${winH}" fill="url(#shinomasWin)" />` +
    `<rect x="${winX}" y="${lineY}" width="${winW}" height="${px(
      5
    )}" fill="url(#shinomasLine)" />`

  // --- セリフ（1 行目のベースラインは下端から 132、行送り 59）---
  // 実機は x=480 から幅 960 のテキスト領域に左揃え。最長行がその幅を超えたときだけ
  // 中央に寄る。ここでは全角 1em / 半角 0.5em で幅を概算する。
  const emWidth = (s: string) =>
    [...s].reduce((n, ch) => n + (/[\x20-\x7e｡-ﾟ]/.test(ch) ? 0.5 : 1), 0)
  const fontSize = px(45.7)
  const maxEm = Math.max(0, ...lines.slice(0, 3).map(emWidth))
  const textX = +Math.min(px(480), (SHINOMAS_OG_W - maxEm * fontSize) / 2).toFixed(2)
  const lineHeight = px(59)
  const firstBaseline = fromBottom(132)
  const dialogue = lines
    .slice(0, 3)
    .map(
      (line, i) =>
        `<text x="${textX}" y="${(firstBaseline + i * lineHeight).toFixed(
          2
        )}" font-size="${fontSize}" font-weight="600" fill="#ffffff" stroke="#000000" stroke-width="${px(
          8
        )}" stroke-linejoin="round" paint-order="stroke fill" font-family="sans-serif">${escapeXml(
          line
        )}</text>`
    )
    .join('')

  const nameText = name
    ? `<text x="${px(462)}" y="${fromBottom(
        217
      )}" font-size="${px(54)}" font-weight="600" fill="#000000" stroke="#ffffff" stroke-width="${px(
        9
      )}" stroke-linejoin="round" paint-order="stroke fill" font-family="sans-serif">${escapeXml(
        name
      )}</text>`
    : ''

  // --- 送りマーク（実機は 1668,975 に 56x64 の素材。その見えている部分の中心に置く）---
  const nx = px(1696)
  const ny = fromBottom(87)
  const next = `<path d="M ${nx - px(24)} ${ny - px(14)} L ${nx + px(24)} ${ny - px(14)} L ${nx} ${
    ny + px(18)
  } Z" fill="#ffffff" stroke="#a97434" stroke-width="${px(
    7
  )}" stroke-linejoin="round" paint-order="stroke fill" />`

  // --- タイトル（全角 1em / 半角 0.5em で概算して横幅に収める）---
  const titleEm = [...title].reduce((n, ch) => n + (/[\x20-\x7e｡-ﾟ]/.test(ch) ? 0.5 : 1), 0)
  const titleSize = Math.min(72, Math.floor(1020 / Math.max(titleEm, 1)))

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SHINOMAS_OG_W}" height="${SHINOMAS_OG_H}" viewBox="0 0 ${SHINOMAS_OG_W} ${SHINOMAS_OG_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shinomasBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a0508" />
      <stop offset="50%" stop-color="#000000" />
      <stop offset="100%" stop-color="#170a12" />
    </linearGradient>
    <linearGradient id="shinomasLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
      <stop offset="30%" stop-color="#ffffff" stop-opacity="1" />
      <stop offset="70%" stop-color="#ffffff" stop-opacity="1" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="shinomasWin" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.85" />
      <stop offset="80%" stop-color="#000000" stop-opacity="0.55" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="${SHINOMAS_OG_W}" height="${SHINOMAS_OG_H}" fill="url(#shinomasBg)" />
  ${buttons}
  <text x="${SHINOMAS_OG_W / 2}" y="260" text-anchor="middle" font-size="${titleSize}" font-weight="bold" fill="#ffffff" stroke="#000000" stroke-width="${
    titleSize / 6
  }" stroke-linejoin="round" paint-order="stroke fill" font-family="sans-serif">${escapeXml(
    title
  )}</text>
  ${win}
  ${nameText}
  ${dialogue}
  ${next}
  <text x="${px(110)}" y="${fromBottom(40)}" font-size="${px(
    30
  )}" fill="rgba(255,255,255,0.6)" font-family="sans-serif">${escapeXml(footer)}</text>
</svg>
`
}
