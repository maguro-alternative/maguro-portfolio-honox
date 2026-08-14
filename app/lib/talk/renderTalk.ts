// ドルフィンウェーブの会話画面風 UI を Canvas に描く。
// 寸法・配色はゲーム画面のスクリーンショット（描画領域 2463x1846 = 4:3）から実測した値を
// REF_W 基準の比率として持ち、任意のキャンバスサイズにスケールして使う。
const REF_W = 2463

/** 自然サイズを読める画像ソース（HTMLImageElement / canvas など）。 */
export type TalkImageSource = CanvasImageSource & {
  naturalWidth?: number
  naturalHeight?: number
  width: number
  height: number
}

export const TALK_ASPECTS = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
} as const

export type TalkAspect = keyof typeof TALK_ASPECTS

/** 出力解像度。幅は固定で、高さをアスペクト比から決める。 */
export function talkCanvasSize(aspect: TalkAspect, width = 1920) {
  return { width, height: Math.round(width / TALK_ASPECTS[aspect]) }
}

export const MAX_LINES = 3

export interface TalkLayer {
  id: string
  image: TalkImageSource
  /** キャンバス幅を 1 とした、中心からの横方向のずれ */
  offX: number
  /** キャンバス高さを 1 とした、中心からの縦方向のずれ */
  offY: number
  /** 1 = キャンバスを覆う倍率 */
  zoom: number
}

export interface TalkScene {
  width: number
  height: number
  background: string
  layers: TalkLayer[]
  name: string
  /** ネームプレート左に置くチームロゴ。読み込み前・未選択なら null */
  logo: TalkImageSource | null
  lines: string[]
  showMenu: boolean
  showSkip: boolean
  showNext: boolean
}

const COLORS = {
  plate: '#ffffff',
  nameText: '#163b69',
  dialogueFill: '#ffffff',
  dialogueOutline: '#000000',
  buttonFace: '#ffffff',
  buttonRing: '#4d95f6',
  buttonIcon: '#5d84bb',
  nextOutline: '#0b1226',
}

// 公式サイト（hpgames.jp/dolphin-wave）の html は font-family:"Noto Sans JP",sans-serif、
// キャラ名の .chara-mv__name は font-weight:900。名前まわりはこれに合わせる。
export const TALK_NAME_FONT_FAMILY = '"Noto Sans JP", sans-serif'

// 公式のお知らせページ（webview-dolphin.marv.jp）の body で使われているスタック。
// セリフ本文と UI ラベルはこちらに合わせる。
export const TALK_DIALOGUE_FONT_FAMILY =
  '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif'

/** REF_W 基準の実測値からキャンバス座標を作るためのスケール */
function unit(width: number) {
  return width / REF_W
}

function imageSize(layer: TalkLayer) {
  const w = layer.image.naturalWidth || (layer.image.width as number)
  const h = layer.image.naturalHeight || (layer.image.height as number)
  return { w, h }
}

/** レイヤーがキャンバス上で占める矩形を返す（ドラッグ判定にも使う）。 */
export function layerRect(layer: TalkLayer, W: number, H: number) {
  const { w, h } = imageSize(layer)
  if (!w || !h) return { x: 0, y: 0, w: 0, h: 0 }
  const cover = Math.max(W / w, H / h)
  const dw = w * cover * layer.zoom
  const dh = h * cover * layer.zoom
  return {
    x: W / 2 + layer.offX * W - dw / 2,
    y: H / 2 + layer.offY * H - dh / 2,
    w: dw,
    h: dh,
  }
}

export function renderTalkScene(ctx: CanvasRenderingContext2D, scene: TalkScene) {
  const { width: W, height: H } = scene
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = scene.background
  ctx.fillRect(0, 0, W, H)

  for (const layer of scene.layers) {
    const r = layerRect(layer, W, H)
    if (r.w <= 0 || r.h <= 0) continue
    ctx.drawImage(layer.image, r.x, r.y, r.w, r.h)
  }

  if (scene.showMenu) drawMenuButtons(ctx, W)
  if (scene.showSkip) drawSkipButton(ctx, W)
  drawNamePlate(ctx, scene)
  drawDialogue(ctx, scene)
  if (scene.showNext) drawNextTriangle(ctx, W, H)
}

// ---------------------------------------------------------------- 上部ボタン

// 実測: 白い円の外径は 60、青リングは半径 53（外端から 7 内側）で太さ 5。
const BTN_R = 60
const BTN_RING_INSET = 7
const BTN_RING_W = 5
const BTN_CX = 103
const BTN_CY = 87
const BTN_GAP = 143

function buttonBase(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, u: number) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.28)'
  ctx.shadowBlur = 10 * u
  ctx.shadowOffsetY = 5 * u
  ctx.fillStyle = COLORS.buttonFace
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.strokeStyle = COLORS.buttonRing
  ctx.lineWidth = BTN_RING_W * u
  ctx.beginPath()
  ctx.arc(cx, cy, r - BTN_RING_INSET * u, 0, Math.PI * 2)
  ctx.stroke()
}

function drawMenuButtons(ctx: CanvasRenderingContext2D, W: number) {
  const u = unit(W)
  const r = BTN_R * u
  const cy = BTN_CY * u
  const icons = [drawLogIcon, drawAutoIcon, drawHideIcon]
  icons.forEach((draw, i) => {
    const cx = (BTN_CX + BTN_GAP * i) * u
    buttonBase(ctx, cx, cy, r, u)
    ctx.save()
    clipInsideRing(ctx, cx, cy, r, u)
    ctx.fillStyle = COLORS.buttonIcon
    ctx.strokeStyle = COLORS.buttonIcon
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    draw(ctx, cx, cy, r)
    ctx.restore()
  })
}

/** アイコンの描画がリングを削らないよう、リング内側で切り抜く。 */
function clipInsideRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  u: number
) {
  ctx.beginPath()
  ctx.arc(cx, cy, r - (BTN_RING_INSET + BTN_RING_W / 2) * u, 0, Math.PI * 2)
  ctx.clip()
}

function drawLogIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // 実測: 枠の外接は 1.10r x 0.80r、線幅 0.092r、尻尾を含めた高さが 0.98r。
  const w = r * 1.008
  const h = r * 0.708
  const x = cx - w / 2
  const y = cy - r * 0.3375
  const rad = r * 0.12
  ctx.lineWidth = r * 0.092
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.lineTo(x + w - rad, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad)
  ctx.lineTo(x + w, y + h - rad)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h)
  ctx.lineTo(x + w * 0.34, y + h)
  ctx.lineTo(x + w * 0.24, y + h + r * 0.1665)
  ctx.lineTo(x + w * 0.2, y + h)
  ctx.lineTo(x + rad, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad)
  ctx.lineTo(x, y + rad)
  ctx.quadraticCurveTo(x, y, x + rad, y)
  ctx.closePath()
  ctx.stroke()
  for (const dx of [-r * 0.221, 0, r * 0.221]) {
    ctx.beginPath()
    ctx.arc(cx + dx, y + h / 2, r * 0.0625, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawAutoIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // フォールバックフォントでも円からはみ出さないよう、実測幅（1.467r）に合わせる
  const target = r * 1.467
  let fs = r * 0.5
  ctx.font = `700 ${fs}px ${TALK_DIALOGUE_FONT_FAMILY}`
  fs *= target / ctx.measureText('AUTO').width
  ctx.font = `700 ${fs}px ${TALK_DIALOGUE_FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('AUTO', cx, cy + r * 0.02)
}

function drawHideIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  // 斜めに傾いた「=」に取り消し線が入った、ウィンドウ非表示のアイコン。
  // 以下はボタン外径が 60 のときの実測座標で、s がキャンバス座標への係数。
  // 棒は傾き 4 の平行四辺形 2 本。取り消し線は x = 2.5 - y の 45 度の線で、
  // 白い抜けはその左下側にだけ入る（右側は棒と繋がったまま）。
  const s = r / BTN_R
  const SKEW = 4
  const X_L = -31
  const X_R = 37

  const bar = (yTop: number, yBottom: number) => {
    ctx.beginPath()
    ctx.moveTo(cx + X_L * s, cy + yTop * s)
    ctx.lineTo(cx + X_R * s, cy + yTop * s)
    ctx.lineTo(cx + (X_R - SKEW) * s, cy + yBottom * s)
    ctx.lineTo(cx + (X_L - SKEW) * s, cy + yBottom * s)
    ctx.closePath()
    ctx.fill()
  }
  bar(-20, -1)
  bar(3, 22)

  // 水平方向の太さを指定して 45 度の線を引く（dx は水平方向のずらし量）。
  // 斜線の端とリングの間に白い余白を残す。実物は半径 48 前後まで伸びるが、
  // 縮小表示で分離が見えるよう、半径 45 前後で止めて余白をやや広めに取っている。
  const SLASH_Y_TOP = -31
  const SLASH_Y_BOTTOM = 33
  const slash = (dx: number, horizontalWidth: number, color: string) => {
    ctx.strokeStyle = color
    ctx.lineWidth = (horizontalWidth / Math.SQRT2) * s
    ctx.beginPath()
    ctx.moveTo(cx + (2.5 - SLASH_Y_TOP + dx) * s, cy + SLASH_Y_TOP * s)
    ctx.lineTo(cx + (2.5 - SLASH_Y_BOTTOM + dx) * s, cy + SLASH_Y_BOTTOM * s)
    ctx.stroke()
  }
  ctx.save()
  ctx.lineCap = 'butt'
  slash(-7, 4, COLORS.buttonFace)
  slash(0, 10, COLORS.buttonIcon)
  ctx.restore()
}

function drawSkipButton(ctx: CanvasRenderingContext2D, W: number) {
  const u = unit(W)
  const r = BTN_R * u
  const cx = W - BTN_CX * u
  const cy = BTN_CY * u
  buttonBase(ctx, cx, cy, r, u)

  ctx.save()
  clipInsideRing(ctx, cx, cy, r, u)
  ctx.fillStyle = COLORS.buttonIcon
  // 「≫|」は水平幅 18 の 45 度の平行四辺形 2 枚と縦棒でできている。
  // 以下はボタン外径が 60 のときの実測座標で、s がキャンバス座標への係数。
  const s = r / BTN_R
  const quad = (points: [number, number][]) => {
    ctx.beginPath()
    points.forEach(([px, py], i) => {
      const X = cx + px * s
      const Y = cy + py * s
      if (i === 0) ctx.moveTo(X, Y)
      else ctx.lineTo(X, Y)
    })
    ctx.closePath()
    ctx.fill()
  }
  quad([
    [-21, -24],
    [-3, -24],
    [23, 2],
    [5, 2],
  ])
  quad([
    [5, 2],
    [23, 2],
    [-3, 28],
    [-21, 28],
  ])
  ctx.fillRect(cx + 20.5 * s, cy - 24.5 * s, 4 * s, 53 * s)
  ctx.restore()
}

// -------------------------------------------------------------- ネームプレート

const PLATE_LEFT = 390
const PLATE_FROM_BOTTOM = 346 // プレート上辺の、下端からの距離
const PLATE_H = 66
const PLATE_MIN_SOLID_W = 435
// プレートは長方形ではなく、上辺に対して下辺が左へずれた平行四辺形。
// 実測: 左辺は上端 x=391 → 下端 x=385（高さ 65 に対して 6px）。右端の各段も同じ傾き。
const PLATE_SHEAR = 6
const LOGO_W = 76
const LOGO_PAD_Y = 2
const NAME_FONT = 47
const NAME_BASELINE = 48 // プレート上辺から

// 実線部の右に続く崩れ。網目ではなく、高さを 3 等分した各段が違う長さで階段状に伸び、
// 少し離れた位置に独立したブロックが付く。実測値（実線部の右端からの相対 px）。
const PLATE_TAIL: { row: 0 | 1 | 2; from: number; to: number }[] = [
  { row: 0, from: 27, to: 115 },
  { row: 1, from: 0, to: 46 },
  { row: 1, from: 73, to: 91 },
  { row: 2, from: 0, to: 23 },
  { row: 2, from: 51, to: 69 },
]

function drawNamePlate(ctx: CanvasRenderingContext2D, scene: TalkScene) {
  const { width: W, height: H } = scene
  const name = scene.name.trim()
  const logo = scene.logo
  if (!name && !logo) return

  const u = unit(W)
  const x = PLATE_LEFT * u
  const y = H - PLATE_FROM_BOTTOM * u
  const h = PLATE_H * u
  const logoW = logo ? LOGO_W * u : 12 * u

  ctx.save()
  ctx.font = `900 ${NAME_FONT * u}px ${TALK_NAME_FONT_FAMILY}`
  const nameW = name ? ctx.measureText(name).width : 0
  ctx.restore()

  const solidW = Math.max(PLATE_MIN_SOLID_W * u, logoW + nameW + 46 * u)

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 9 * u
  ctx.shadowOffsetX = 4 * u
  ctx.shadowOffsetY = 4 * u
  ctx.fillStyle = COLORS.plate
  // プレート上辺を原点にして、下へ行くほど左へずれるせん断をかける。
  // 実線部と右端の崩れは 1 つのパスにまとめて塗る（別々に塗ると影が継ぎ目に乗る）。
  ctx.translate(x, y)
  ctx.transform(1, 0, -PLATE_SHEAR / PLATE_H, 1, 0, 0)
  const rowH = h / 3
  ctx.beginPath()
  ctx.rect(0, 0, solidW, h)
  for (const seg of PLATE_TAIL) {
    ctx.rect(solidW + seg.from * u, seg.row * rowH, (seg.to - seg.from) * u, rowH)
  }
  ctx.fill()
  ctx.restore()

  // ロゴはプレートの傾きに巻き込まれないよう、せん断の外で枠に収めて描く。
  if (logo) {
    const iw = logo.naturalWidth || logo.width
    const ih = logo.naturalHeight || logo.height
    if (iw && ih) {
      const boxW = LOGO_W * u
      const boxH = (PLATE_H - LOGO_PAD_Y * 2) * u
      const scale = Math.min(boxW / iw, boxH / ih)
      const dw = iw * scale
      const dh = ih * scale
      ctx.drawImage(logo, x + (boxW - dw) / 2, y + LOGO_PAD_Y * u + (boxH - dh) / 2, dw, dh)
    }
  }

  if (name) {
    ctx.save()
    ctx.fillStyle = COLORS.nameText
    ctx.font = `900 ${NAME_FONT * u}px ${TALK_NAME_FONT_FAMILY}`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(name, x + logoW + 2 * u, y + NAME_BASELINE * u)
    ctx.restore()
  }
}

// -------------------------------------------------------------------- セリフ

const TEXT_LEFT = 565
const TEXT_FONT = 54
const TEXT_LINE_HEIGHT = 68
// ゲームは 1 行目の位置を固定して下に伸ばす（1 行のスクショでも 2 行のスクショの
// 1 行目と同じ高さに出る）。最終行を下端に合わせると 1 行のとき 1 行分低くなる。
const TEXT_FIRST_BASELINE_FROM_BOTTOM = 205

function drawDialogue(ctx: CanvasRenderingContext2D, scene: TalkScene) {
  const { width: W, height: H } = scene
  const lines = scene.lines.slice(0, MAX_LINES)
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  if (lines.length === 0) return

  const u = unit(W)
  const fs = TEXT_FONT * u
  const lh = TEXT_LINE_HEIGHT * u
  const firstBaseline = H - TEXT_FIRST_BASELINE_FROM_BOTTOM * u

  ctx.save()
  ctx.font = `900 ${fs}px ${TALK_DIALOGUE_FONT_FAMILY}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.lineJoin = 'round'
  ctx.miterLimit = 2
  ctx.lineWidth = fs * 0.2
  ctx.strokeStyle = COLORS.dialogueOutline
  ctx.fillStyle = COLORS.dialogueFill

  lines.forEach((line, i) => {
    const y = firstBaseline + i * lh
    ctx.strokeText(line, TEXT_LEFT * u, y)
  })
  lines.forEach((line, i) => {
    const y = firstBaseline + i * lh
    ctx.fillText(line, TEXT_LEFT * u, y)
  })
  ctx.restore()
}

// -------------------------------------------------------------------- ▽

// 実測: 白い三角は 42x24、そこに太さ 12.8 の濃紺のフチが付き、外周は 60x37。
// 実物はゆっくり上下に動くので、中心の高さは動きの中間あたりに置いている。
const NEXT_CX = 1954
const NEXT_FROM_BOTTOM = 90
const NEXT_HALF_W = 21
const NEXT_H = 24
// 実測は 12.4 相当だが、縮小表示だと重く見えるのでやや細めにしている。
const NEXT_OUTLINE_W = 11

function drawNextTriangle(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const u = unit(W)
  const cx = NEXT_CX * u
  const cy = H - NEXT_FROM_BOTTOM * u
  ctx.save()
  ctx.lineJoin = 'round'
  ctx.lineWidth = NEXT_OUTLINE_W * u
  ctx.strokeStyle = COLORS.nextOutline
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(cx - NEXT_HALF_W * u, cy - (NEXT_H / 2) * u)
  ctx.lineTo(cx + NEXT_HALF_W * u, cy - (NEXT_H / 2) * u)
  ctx.lineTo(cx, cy + (NEXT_H / 2) * u)
  ctx.closePath()
  ctx.stroke()
  ctx.fill()
  ctx.restore()
}
