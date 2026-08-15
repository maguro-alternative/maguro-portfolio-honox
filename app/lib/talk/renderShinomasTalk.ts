// シノビマスター 閃乱カグラ NEW LINK の ADV（会話）画面風 UI を Canvas に描く。
// 寸法はゲーム実機のスクリーンショット（1920x1080）から実測した値。
// REF_W 基準の比率として持ち、任意サイズにスケールする。
// 上下に張り付く要素は下端からの距離で持つ（4:3 でも下に付いてほしいため）。
//
// ウィンドウ・上部ボタン・▽ はゲームの画像を貼らず、実測した形・色・不透明度をもとに
// ここで描き起こしている。画像を使うのは所属エンブレムだけ。
import { layerRect, MAX_LINES, type TalkLayer, type TalkImageSource } from './renderTalk'

export { MAX_LINES, TALK_ASPECTS, talkCanvasSize } from './renderTalk'
export type { TalkAspect, TalkImageSource, TalkLayer } from './renderTalk'

const REF_W = 1920

export interface ShinomasScene {
  width: number
  height: number
  background: string
  layers: TalkLayer[]
  name: string
  /** 名前の左に添えるエンブレム。未選択・読み込み前は null */
  emblem: TalkImageSource | null
  lines: string[]
  showLog: boolean
  showSkip: boolean
  showNext: boolean
  /** 名前欄。地の文のように話者を出さない場面では外す */
  showName: boolean
  /** 早送りボタンを一時停止（⏸）の見た目にする */
  paused: boolean
}

const COLORS = {
  // セリフ本文は白抜きに黒フチ
  textFill: '#ffffff',
  textOutline: '#000000',
  // 名前だけは逆で、黒文字に白フチ
  nameFill: '#000000',
  nameOutline: '#ffffff',
}

// ゲームは FOT-新ロダン Pro DB（フォントワークスの商用書体）を使っている。
// Web で使えるフリー版が無いため、抽出アトラスとの比較でインク被覆率・形状が最も近かった
// Noto Sans JP の可変ウェイト 575 で代用する（静的 Bold の 700 は明確に太すぎる）。
// Canvas は font-variation-settings を見ないので、数値ウェイトを font 文字列に直接書く。
export const SHINOMAS_FONT_FAMILY = '"Noto Sans JP", sans-serif'
export const SHINOMAS_FONT_WEIGHT = 575

function font(size: number) {
  return `${SHINOMAS_FONT_WEIGHT} ${size}px ${SHINOMAS_FONT_FAMILY}`
}

/** REF_W 基準の実測値からキャンバス座標を作るためのスケール */
function unit(width: number) {
  return width / REF_W
}

export function renderShinomasScene(ctx: CanvasRenderingContext2D, scene: ShinomasScene) {
  const { width: W, height: H } = scene
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = scene.background
  ctx.fillRect(0, 0, W, H)

  for (const layer of scene.layers) {
    const r = layerRect(layer, W, H)
    if (r.w <= 0 || r.h <= 0) continue
    ctx.drawImage(layer.image, r.x, r.y, r.w, r.h)
  }

  drawWindow(ctx, scene)
  drawButtons(ctx, scene)
  if (scene.showName) drawName(ctx, scene)
  drawDialogue(ctx, scene)
  if (scene.showNext) drawNext(ctx, scene)
  drawCredit(ctx, W, H)
}

// ------------------------------------------------------------ 会話ウィンドウ

// ウィンドウは x=181 から画面中央 960 を軸に左右対称で、下端から 216 の位置に高さ 192。
// 上端に白い横線、その下に黒い帯、帯の中に流水紋。どれも下と左右の端に向かって薄れる。
//
// 実機の素材をそのまま貼るのではなく、実測した配置・不透明度に合わせて描き起こしている。
// 2 方向のフェードを掛けるためにオフスクリーンで一度組み立ててから貼る。
const WIN_X = 181
const WIN_TOP_FROM_BOTTOM = 216
const WIN_H = 192
/** ウィンドウ全体の幅（左右の余白 181 を除いた分） */
const WIN_W = REF_W - WIN_X * 2

/** 帯の濃さと、下端に向かうフェードの開始・終了（いずれも素材からの実測値） */
const WIN_DARK_ALPHA = 0.3
const WIN_DARK_TOP = 15
const WIN_FADE_FROM = 102
const WIN_FADE_TO = 176

/** 流水紋の濃さ。実機は黒地の上で最大 51/255 だった */
const WIN_PATTERN_ALPHA = 0.2

/** 上端の白線。太さ 5 で、中央がわずかに暗い */
const WIN_LINE_TOP = 10
const WIN_LINE_H = 5

let windowTextureCache: { key: string; canvas: HTMLCanvasElement } | null = null

/**
 * 流水紋。左半分ぶんを 1558x192 の座標系で不透明な白で描く（右半分は呼び出し側で反転させる）。
 * 重なった部分が濃くならないよう、別レイヤーに描いてからまとめて薄くして合成する。
 * 実機の意匠に寄せた、ゆるやかな蛇行を平行に何本か重ねたもの。
 */
function strokeFlowPattern(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = '#ffffff'
  ctx.lineCap = 'round'

  // 右端で折り返す大きなヘアピン。少しずつずらして平行に重ねる。
  for (let i = 0; i < 5; i++) {
    const d = i * 8
    ctx.lineWidth = 3.2 - i * 0.35
    ctx.beginPath()
    ctx.moveTo(96 + d * 0.5, 66 + d)
    ctx.bezierCurveTo(210, 54 + d, 320, 66 + d, 388 - d * 0.6, 100 + d * 0.7)
    ctx.bezierCurveTo(432 - d * 0.8, 122 + d * 0.6, 404 - d * 0.7, 148 - d * 0.1, 320 - d * 0.9, 150 - d * 0.3)
    ctx.bezierCurveTo(226 - d * 0.9, 152 - d * 0.4, 132 - d * 0.7, 160 - d * 0.5, 58, 174 - d * 0.7)
    ctx.stroke()
  }

  // 左上に伸びる小さめの渦。流水紋の穂先にあたる部分。
  for (let i = 0; i < 3; i++) {
    const d = i * 8
    ctx.lineWidth = 2.8 - i * 0.35
    ctx.beginPath()
    ctx.moveTo(214 + d * 1.2, 16 + d * 0.6)
    ctx.bezierCurveTo(156 + d, 20 + d * 0.7, 108 + d * 0.7, 36 + d * 0.6, 112 + d * 0.6, 56 + d * 0.4)
    ctx.bezierCurveTo(116 + d * 0.5, 76 + d * 0.3, 162 + d * 0.4, 86 + d * 0.2, 206 + d * 0.3, 88 + d * 0.2)
    ctx.stroke()
  }
}

/** ウィンドウ 1 枚ぶんのテクスチャを組み立てる。サイズが同じなら使い回す。 */
function getWindowTexture(w: number, h: number): HTMLCanvasElement | null {
  if (w <= 0 || h <= 0) return null
  const key = `${w}x${h}`
  if (windowTextureCache && windowTextureCache.key === key) return windowTextureCache.canvas

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const c = canvas.getContext('2d')
  if (!c) return null

  // 以下は 1558x192 の座標系で描く
  const s = w / WIN_W
  c.save()
  c.scale(s, s)

  // 黒い帯（下へ向かって薄れる）
  const band = c.createLinearGradient(0, 0, 0, WIN_H)
  band.addColorStop(0, `rgba(0,0,0,${WIN_DARK_ALPHA})`)
  band.addColorStop(WIN_FADE_FROM / WIN_H, `rgba(0,0,0,${WIN_DARK_ALPHA})`)
  band.addColorStop(WIN_FADE_TO / WIN_H, 'rgba(0,0,0,0)')
  band.addColorStop(1, 'rgba(0,0,0,0)')
  c.fillStyle = band
  c.fillRect(0, WIN_DARK_TOP, WIN_W, WIN_H - WIN_DARK_TOP)

  c.restore()

  // 流水紋。実機は線が重なっても濃くならない（明るさの上限が 51/255 だった）ので、
  // 別レイヤーに不透明で描いてから、全体を一定の薄さで重ねる。
  const layer = document.createElement('canvas')
  layer.width = w
  layer.height = h
  const lc = layer.getContext('2d')
  if (lc) {
    lc.scale(s, s)
    strokeFlowPattern(lc)
    lc.save()
    lc.translate(WIN_W, 0)
    lc.scale(-1, 1)
    strokeFlowPattern(lc)
    lc.restore()
    // 下端へ向かってのフェード
    lc.setTransform(1, 0, 0, 1, 0, 0)
    lc.globalCompositeOperation = 'destination-in'
    const vFade = lc.createLinearGradient(0, 0, 0, h)
    vFade.addColorStop(0, 'rgba(0,0,0,1)')
    vFade.addColorStop(0.62, 'rgba(0,0,0,1)')
    vFade.addColorStop(1, 'rgba(0,0,0,0)')
    lc.fillStyle = vFade
    lc.fillRect(0, 0, w, h)

    c.save()
    c.globalAlpha = WIN_PATTERN_ALPHA
    c.drawImage(layer, 0, 0)
    c.restore()
  }

  // 帯と流水紋にだけ、左右端へのフェードを掛ける
  c.save()
  c.globalCompositeOperation = 'destination-in'
  const sideFade = c.createLinearGradient(0, 0, w, 0)
  sideFade.addColorStop(0, 'rgba(0,0,0,0)')
  sideFade.addColorStop((150 * s) / w, 'rgba(0,0,0,1)')
  sideFade.addColorStop(1 - (150 * s) / w, 'rgba(0,0,0,1)')
  sideFade.addColorStop(1, 'rgba(0,0,0,0)')
  c.fillStyle = sideFade
  c.fillRect(0, 0, w, h)
  c.restore()

  // 白線は帯より緩やかに現れるので、フェードを掛けたあとに別で描く
  c.save()
  c.scale(s, s)
  const line = c.createLinearGradient(0, 0, WIN_W, 0)
  line.addColorStop(0, 'rgba(255,255,255,0)')
  line.addColorStop(0.09, 'rgba(255,255,255,0.42)')
  line.addColorStop(0.29, 'rgba(255,255,255,0.93)')
  line.addColorStop(0.5, 'rgba(255,255,255,0.99)')
  line.addColorStop(0.71, 'rgba(255,255,255,0.93)')
  line.addColorStop(0.91, 'rgba(255,255,255,0.42)')
  line.addColorStop(1, 'rgba(255,255,255,0)')
  c.fillStyle = line
  c.fillRect(0, WIN_LINE_TOP, WIN_W, WIN_LINE_H)
  // 実機は線の中ほどがわずかに暗い
  c.fillStyle = 'rgba(0,0,0,0.13)'
  c.fillRect(0, WIN_LINE_TOP + 1, WIN_W, WIN_LINE_H - 2)
  c.restore()

  windowTextureCache = { key, canvas }
  return canvas
}

function drawWindow(ctx: CanvasRenderingContext2D, scene: ShinomasScene) {
  const { width: W, height: H } = scene
  const u = unit(W)
  const w = Math.round(WIN_W * u)
  const h = Math.round(WIN_H * u)
  const tex = getWindowTexture(w, h)
  if (!tex) return
  ctx.drawImage(tex, WIN_X * u, H - WIN_TOP_FROM_BOTTOM * u, WIN_W * u, WIN_H * u)
}

// -------------------------------------------------------------- 上部ボタン

// 120x120 の枠に、白いリング＋うっすら明るい塗り＋白いアイコン、右下に淡い影。
// 以下の座標はすべて 120x120 の枠内のもので、素材から実測した値。
const BTN_SIZE = 120
const BTN_Y = 10
const BTN_LOG_X = 50
/** 早送りボタン右端の、画面右端からの距離。ログボタンと左右対称になる */
const BTN_SKIP_FROM_RIGHT = 50

const BTN_CX = 59.5
const BTN_R = 48.5
const BTN_RING_W = 3
const BTN_FILL = 'rgba(161,161,161,0.25)'

type ButtonIcon = 'log' | 'skip' | 'pause'

function drawCircleButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  icon: ButtonIcon
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / BTN_SIZE, size / BTN_SIZE)

  // 影。円の外側だけを残して、丸ごと塗った影を落とす
  ctx.save()
  ctx.beginPath()
  ctx.rect(-24, -24, BTN_SIZE + 48, BTN_SIZE + 48)
  ctx.arc(BTN_CX, BTN_CX, BTN_R + BTN_RING_W / 2, 0, Math.PI * 2, true)
  ctx.clip('evenodd')
  ctx.shadowColor = 'rgba(15,5,10,0.45)'
  ctx.shadowBlur = 7
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 3
  ctx.fillStyle = '#000000'
  ctx.beginPath()
  ctx.arc(BTN_CX, BTN_CX, BTN_R + BTN_RING_W / 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.fillStyle = BTN_FILL
  ctx.beginPath()
  ctx.arc(BTN_CX, BTN_CX, BTN_R, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = BTN_RING_W
  ctx.beginPath()
  ctx.arc(BTN_CX, BTN_CX, BTN_R, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#ffffff'
  if (icon === 'skip') drawSkipIcon(ctx)
  else if (icon === 'pause') drawPauseIcon(ctx)
  else drawLogIcon(ctx)

  ctx.restore()
}

/** ≫。片方は 6 角形で、腕の先が尖っている */
function drawSkipIcon(ctx: CanvasRenderingContext2D) {
  const chevron = (ox: number) => {
    ctx.beginPath()
    ctx.moveTo(ox + 42, 35.5)
    ctx.lineTo(ox + 66.5, 60)
    ctx.lineTo(ox + 42, 84.5)
    ctx.lineTo(ox + 35.5, 78)
    ctx.lineTo(ox + 52, 60)
    ctx.lineTo(ox + 35.5, 42)
    ctx.closePath()
    ctx.fill()
  }
  chevron(0)
  chevron(23)
}

/** ⏸ */
function drawPauseIcon(ctx: CanvasRenderingContext2D) {
  ctx.fillRect(39, 37, 15, 46)
  ctx.fillRect(66, 37, 15, 46)
}

/** セリフログの吹き出し。角丸の枠と、左下に伸びる尻尾、中に 3 つの点 */
function drawLogIcon(ctx: CanvasRenderingContext2D) {
  const L = 30.5
  const R = 89.5
  const T = 36.5
  const B = 78.5
  const r = 7

  ctx.lineWidth = 5.5
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(L + r, T)
  ctx.lineTo(R - r, T)
  ctx.quadraticCurveTo(R, T, R, T + r)
  ctx.lineTo(R, B - r)
  ctx.quadraticCurveTo(R, B, R - r, B)
  ctx.lineTo(58, B)
  ctx.lineTo(43.5, 90.5)
  ctx.lineTo(42.5, B)
  ctx.lineTo(L + r, B)
  ctx.quadraticCurveTo(L, B, L, B - r)
  ctx.lineTo(L, T + r)
  ctx.quadraticCurveTo(L, T, L + r, T)
  ctx.closePath()
  ctx.stroke()

  for (const cx of [43.5, 59.5, 75.5]) {
    ctx.beginPath()
    ctx.arc(cx, 57.5, 5, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawButtons(ctx: CanvasRenderingContext2D, scene: ShinomasScene) {
  const u = unit(scene.width)
  const size = BTN_SIZE * u
  if (scene.showLog) drawCircleButton(ctx, BTN_LOG_X * u, BTN_Y * u, size, 'log')
  if (scene.showSkip) {
    const x = scene.width - (BTN_SKIP_FROM_RIGHT + BTN_SIZE) * u
    drawCircleButton(ctx, x, BTN_Y * u, size, scene.paused ? 'pause' : 'skip')
  }
}

// -------------------------------------------------------------------- 名前欄

// 名前が写っているスクショ 4 枚（焔 / 飛鳥 / 春花 / 葛城）から実測。
// エンブレムは 80x80 の素材を等倍で置いていて、名前とは別に固定位置
// （どちらのスクショでも (388,800) にピクセル単位で一致する）。
// 本文と違い、名前は黒文字＋細い白フチ。サイズ・位置は白フチの内側にある
// 黒いグリフの形で合わせた値。
const NAME_FONT = 54
const NAME_LEFT = 462
const NAME_BASELINE_FROM_BOTTOM = 217
const EMBLEM_X = 388
const EMBLEM_SIZE = 80
const EMBLEM_TOP_FROM_BOTTOM = 280

function drawName(ctx: CanvasRenderingContext2D, scene: ShinomasScene) {
  const name = scene.name.trim()
  const emblem = scene.emblem
  if (!name && !emblem) return

  const { width: W, height: H } = scene
  const u = unit(W)

  if (emblem) {
    const iw = emblem.naturalWidth || (emblem.width as number)
    const ih = emblem.naturalHeight || (emblem.height as number)
    if (iw && ih) {
      const box = EMBLEM_SIZE * u
      const scale = Math.min(box / iw, box / ih)
      const dw = iw * scale
      const dh = ih * scale
      const x = EMBLEM_X * u
      const y = H - EMBLEM_TOP_FROM_BOTTOM * u
      ctx.drawImage(emblem, x + (box - dw) / 2, y + (box - dh) / 2, dw, dh)
    }
  }

  if (!name) return
  const fs = NAME_FONT * u
  ctx.save()
  ctx.font = font(fs)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  // 実測の白フチは外側に 2.8px ほど。線は輪郭の中心に乗るので倍の太さを指定する。
  ctx.lineWidth = fs * 0.1
  ctx.strokeStyle = COLORS.nameOutline
  ctx.fillStyle = COLORS.nameFill
  const baseline = H - NAME_BASELINE_FROM_BOTTOM * u
  ctx.strokeText(name, NAME_LEFT * u, baseline)
  ctx.fillText(name, NAME_LEFT * u, baseline)
  ctx.restore()
}

// -------------------------------------------------------------------- セリフ

// 全角 1 文字の送りが実測 45.7 なので、フォントサイズは 45.7。
// 1 行目のベースラインは 948（下端から 132）、行送りは 59。
//
// 左端は「x=480 から幅 960（= 全角 21 文字ぶん・画面中央 960 に対して左右対称）の
// テキスト領域に左揃え」。ただし最長行がその幅を超えると、はみ出しが左右均等になるよう
// 中央に寄る。スクショ 5 枚の左端（480 / 480 / 480 / 434 / 366、最長行は 8 / 14 / 19 /
// 23 / 26 文字）がこの規則で全部説明できる。各行は最長行の左端に揃う。
const TEXT_FONT = 45.7
const TEXT_LINE_HEIGHT = 59
const TEXT_FIRST_BASELINE_FROM_BOTTOM = 132
const TEXT_AREA_LEFT = 480

function drawDialogue(ctx: CanvasRenderingContext2D, scene: ShinomasScene) {
  const { width: W, height: H } = scene
  const lines = scene.lines.slice(0, MAX_LINES)
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  if (lines.length === 0) return

  const u = unit(W)
  const fs = TEXT_FONT * u
  const lh = TEXT_LINE_HEIGHT * u
  const firstBaseline = H - TEXT_FIRST_BASELINE_FROM_BOTTOM * u

  ctx.save()
  ctx.font = font(fs)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.lineWidth = fs * 0.18
  ctx.strokeStyle = COLORS.textOutline
  ctx.fillStyle = COLORS.textFill

  // 最長行の幅でブロックの左端を決め、各行はそこに左揃えする
  const maxW = Math.max(...lines.map((line) => ctx.measureText(line).width))
  const left = Math.min(TEXT_AREA_LEFT * u, (W - maxW) / 2)

  // 縁取りが隣の字の本体に被らないよう、全行の縁を描いてから全行を塗る
  lines.forEach((line, i) => ctx.strokeText(line, left, firstBaseline + i * lh))
  lines.forEach((line, i) => ctx.fillText(line, left, firstBaseline + i * lh))
  ctx.restore()
}

// ------------------------------------------------------------------ ▽マーカー

// 実機では上下に揺れる（スクショ 4 枚で y=966 / 971 / 974 / 975）。
// 静止画出力なのでその平均あたりに固定で置く。
// 角丸の逆三角形で、白いフチ・金茶のフチ・白い面の三層。座標は 56x64 の枠内。
const NEXT_X = 1668
const NEXT_TOP_FROM_BOTTOM = 109
const NEXT_W = 56
const NEXT_H = 64

const NEXT_GOLD = 'rgb(120,80,25)'

/** 角丸の逆三角形のパス */
function nextTrianglePath(ctx: CanvasRenderingContext2D) {
  // 金茶のフチの中心線。素材の各行での金茶の位置から起こした値。
  const pts: [number, number][] = [
    [5, 9],
    [50, 9],
    [27.5, 35.5],
  ]
  const r = 8
  ctx.beginPath()
  for (let i = 0; i < 3; i++) {
    const prev = pts[(i + 2) % 3]
    const cur = pts[i]
    const next = pts[(i + 1) % 3]
    const toPrev = norm(prev[0] - cur[0], prev[1] - cur[1])
    const toNext = norm(next[0] - cur[0], next[1] - cur[1])
    const a: [number, number] = [cur[0] + toPrev[0] * r, cur[1] + toPrev[1] * r]
    const b: [number, number] = [cur[0] + toNext[0] * r, cur[1] + toNext[1] * r]
    if (i === 0) ctx.moveTo(a[0], a[1])
    else ctx.lineTo(a[0], a[1])
    ctx.quadraticCurveTo(cur[0], cur[1], b[0], b[1])
  }
  ctx.closePath()
}

function norm(x: number, y: number): [number, number] {
  const d = Math.hypot(x, y) || 1
  return [x / d, y / d]
}

function drawNext(ctx: CanvasRenderingContext2D, scene: ShinomasScene) {
  const { width: W, height: H } = scene
  const u = unit(W)
  // 画面右端からの距離で持ち、4:3 でもウィンドウ右端との関係が崩れないようにする
  const x = W - (REF_W - NEXT_X) * u
  const y = H - NEXT_TOP_FROM_BOTTOM * u

  ctx.save()
  ctx.translate(x, y)
  ctx.scale((NEXT_W * u) / NEXT_W, (NEXT_H * u) / NEXT_H)
  ctx.lineJoin = 'round'

  // 下に落ちる淡い影
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.filter = 'blur(4px)'
  ctx.beginPath()
  ctx.ellipse(28, 46, 19, 7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // 白いフチ（外側にぼんやり光る）
  ctx.save()
  ctx.shadowColor = 'rgba(255,255,255,0.85)'
  ctx.shadowBlur = 4
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 8
  nextTrianglePath(ctx)
  ctx.stroke()
  ctx.restore()

  // 金茶のフチ
  ctx.strokeStyle = NEXT_GOLD
  ctx.lineWidth = 4
  nextTrianglePath(ctx)
  ctx.stroke()

  // 面。うっすら青みのある白
  const face = ctx.createLinearGradient(0, 8, 0, 36)
  face.addColorStop(0, '#ffffff')
  face.addColorStop(0.55, '#f4f8ff')
  face.addColorStop(1, '#ffffff')
  ctx.fillStyle = face
  nextTrianglePath(ctx)
  ctx.fill()

  // 面に入る青い斜めの筋
  ctx.save()
  nextTrianglePath(ctx)
  ctx.clip()
  ctx.strokeStyle = 'rgba(120,160,225,0.85)'
  ctx.lineWidth = 2.6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(43, 14)
  ctx.lineTo(24, 31)
  ctx.stroke()
  ctx.restore()

  ctx.restore()
}

// ------------------------------------------------------- メーカーのクレジット

// このツールで作った画像だと分かるよう、右下に焼き込む。
const CREDIT_TEXT = 'maguro-alternative.com/talk/shinomas'
const CREDIT_FONT = 20
const CREDIT_RIGHT = 24
const CREDIT_BOTTOM = 14

function drawCredit(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const u = unit(W)
  const fs = CREDIT_FONT * u
  ctx.save()
  ctx.font = font(fs)
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.lineWidth = fs * 0.3
  ctx.strokeStyle = 'rgba(0,0,0,0.45)'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.strokeText(CREDIT_TEXT, W - CREDIT_RIGHT * u, H - CREDIT_BOTTOM * u)
  ctx.fillText(CREDIT_TEXT, W - CREDIT_RIGHT * u, H - CREDIT_BOTTOM * u)
  ctx.restore()
}
