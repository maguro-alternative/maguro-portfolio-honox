// セリフメーカーのネームプレートに置くチームエンブレム。
// 公式ロゴは転載せず、チームカラー + 幾何学的なモチーフで自前に描き起こしている。

export type EmblemKind =
  | 'swirl'
  | 'wind'
  | 'sun'
  | 'trident'
  | 'gear'
  | 'radio'
  | 'star'
  | 'pentagram'

export interface TalkTeam {
  id: string
  label: string
  color: string
  emblem: EmblemKind
}

export const talkTeams: TalkTeam[] = [
  { id: 'kirishima', label: 'KIRISHIMA', color: '#b02424', emblem: 'swirl' },
  { id: 'kazami', label: 'KAZAMI TECH', color: '#2e9e6b', emblem: 'wind' },
  { id: 'hyuga', label: '日向重工', color: '#e08a1e', emblem: 'sun' },
  { id: 'nereides', label: 'NereIdes', color: '#6f4bbd', emblem: 'trident' },
  { id: 'urami', label: '浦見製鉄所', color: '#5a6b7a', emblem: 'gear' },
  { id: 'wadatsumi', label: 'FMワダツミ', color: '#d9a41c', emblem: 'radio' },
  { id: 'isrw', label: 'ISRW', color: '#2563a8', emblem: 'star' },
  { id: 'goetia', label: 'GRIMO→GOETIA', color: '#4a3f6b', emblem: 'pentagram' },
]

export function findTeam(id: string | null): TalkTeam | null {
  if (!id) return null
  return talkTeams.find((t) => t.id === id) ?? null
}

// dolphinCharacters の team 文字列 → チーム id
const TEAM_BY_CHARACTER_TEAM: Record<string, string> = {
  KIRISHIMA: 'kirishima',
  'KAZAMI TECH': 'kazami',
  日向重工: 'hyuga',
  NereIdes: 'nereides',
  浦見製鉄所: 'urami',
  FMワダツミ: 'wadatsumi',
  ISRW: 'isrw',
  'GRIMO→GOETIA': 'goetia',
}

export function teamIdForCharacterTeam(team: string): string | null {
  return TEAM_BY_CHARACTER_TEAM[team] ?? null
}

/** 半径 r の円の中にエンブレムを描く。円の塗りつぶしもここで行う。 */
export function drawEmblem(
  ctx: CanvasRenderingContext2D,
  team: TalkTeam,
  cx: number,
  cy: number,
  r: number
) {
  ctx.save()
  ctx.fillStyle = team.color
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#ffffff'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  switch (team.emblem) {
    case 'swirl':
      drawSwirl(ctx, cx, cy, r, team.color)
      break
    case 'wind':
      drawWind(ctx, cx, cy, r)
      break
    case 'sun':
      drawSun(ctx, cx, cy, r)
      break
    case 'trident':
      drawTrident(ctx, cx, cy, r)
      break
    case 'gear':
      drawGear(ctx, cx, cy, r)
      break
    case 'radio':
      drawRadio(ctx, cx, cy, r)
      break
    case 'star':
      drawStar(ctx, cx, cy, r * 0.72, r * 0.3, 5, -Math.PI / 2)
      ctx.fill()
      break
    case 'pentagram':
      drawPentagram(ctx, cx, cy, r)
      break
  }
  ctx.restore()
}

function drawSwirl(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string
) {
  // 勾玉が巻き込むような渦。太極図の片側と同じ描き方。
  const R = r * 0.68
  ctx.beginPath()
  ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2)
  ctx.arc(cx, cy + R / 2, R / 2, Math.PI / 2, -Math.PI / 2, true)
  ctx.arc(cx, cy - R / 2, R / 2, Math.PI / 2, -Math.PI / 2)
  ctx.closePath()
  ctx.fill()
  // 勾玉の目
  ctx.beginPath()
  ctx.arc(cx, cy + R / 2, R * 0.18, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.fillStyle = '#ffffff'
}

function drawWind(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const w = r * 0.22
  ctx.lineWidth = w
  const rows: [number, number][] = [
    [-r * 0.36, r * 0.62],
    [0, r * 0.78],
    [r * 0.36, r * 0.5],
  ]
  for (const [dy, len] of rows) {
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.68, cy + dy)
    ctx.lineTo(cx - r * 0.68 + len, cy + dy)
    ctx.stroke()
  }
  // 先端のカール
  ctx.beginPath()
  ctx.arc(cx + r * 0.12, cy, r * 0.24, Math.PI * 0.5, Math.PI * 1.85)
  ctx.stroke()
}

function drawSun(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.36, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = r * 0.14
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * r * 0.52, cy + Math.sin(a) * r * 0.52)
    ctx.lineTo(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78)
    ctx.stroke()
  }
}

function drawTrident(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.lineWidth = r * 0.16
  const top = cy - r * 0.66
  const bar = cy - r * 0.18
  for (const dx of [-r * 0.44, 0, r * 0.44]) {
    ctx.beginPath()
    ctx.moveTo(cx + dx, top)
    ctx.lineTo(cx + dx, bar)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.48, bar)
  ctx.lineTo(cx + r * 0.48, bar)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, bar)
  ctx.lineTo(cx, cy + r * 0.68)
  ctx.stroke()
}

function drawGear(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const outer = r * 0.76
  const inner = r * 0.54
  const teeth = 8
  ctx.beginPath()
  for (let i = 0; i < teeth * 2; i++) {
    const a = (Math.PI / teeth) * i - Math.PI / 2
    const rad = i % 2 === 0 ? outer : inner
    const x = cx + Math.cos(a) * rad
    const y = cy + Math.sin(a) * rad
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  // 中心の穴をチームカラーで抜く
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.26, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'
}

function drawRadio(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.17, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = r * 0.14
  for (const rad of [r * 0.42, r * 0.68]) {
    ctx.beginPath()
    ctx.arc(cx, cy, rad, -Math.PI * 0.28, Math.PI * 0.28)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, rad, Math.PI * 0.72, Math.PI * 1.28)
    ctx.stroke()
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points: number,
  rotation: number
) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const a = (Math.PI / points) * i + rotation
    const rad = i % 2 === 0 ? outer : inner
    const x = cx + Math.cos(a) * rad
    const y = cy + Math.sin(a) * rad
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
}

function drawPentagram(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.lineWidth = r * 0.11
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2)
  ctx.stroke()
  const pts: [number, number][] = []
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
    pts.push([cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6])
  }
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const [x, y] = pts[(i * 2) % 5]
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()
}
