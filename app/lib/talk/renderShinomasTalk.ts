// シノビマスター 閃乱カグラ NEW LINK の ADV（会話）画面風 UI を Canvas に描く。
// 寸法はゲーム実機のスクリーンショット（docs/shinomas-talk-reference.png / 1920x1080）に
// 抽出アセットを重ねて突き合わせた実測値。REF_W 基準の比率として持ち、任意サイズにスケールする。
//
// スクショと突き合わせた結果、UI はどれも素材のドットそのまま（1920 幅に対して等倍）で
// 置かれていた。上下に張り付く要素は下端からの距離で持つ（4:3 でも下に付いてほしいため）。
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
  /** cmn_mes_win01.png */
  windowImage: TalkImageSource | null
  /** adv_btn01.png（>>）か adv_btn02.png（⏸）。左右 2 分割のアトラス */
  buttonAtlas: TalkImageSource | null
  /** cmn_next01.png */
  nextImage: TalkImageSource | null
  showLog: boolean
  showSkip: boolean
  showNext: boolean
  /** 名前欄。地の文のように話者を出さない場面では外す */
  showName: boolean
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
  if (scene.showLog) drawAtlasButton(ctx, scene, 'log')
  if (scene.showSkip) drawAtlasButton(ctx, scene, 'skip')
  if (scene.showName) drawName(ctx, scene)
  drawDialogue(ctx, scene)
  if (scene.showNext) drawNext(ctx, scene)
  drawCredit(ctx, W, H)
}

// ------------------------------------------------------------ 会話ウィンドウ

// cmn_mes_win01.png（512x192）は窓の左半分ぶんしかない。実機は
// 「左端＝素材そのまま / 中央＝素材右端の 1 列を引き伸ばし / 右端＝左右反転」の 3 分割で、
// 画面中央（x=960）を軸に左右対称になる。等倍で置くと素材の流水紋がスクショと一致する。
const WIN_X = 181
const WIN_TOP_FROM_BOTTOM = 216
const WIN_W = 512
const WIN_H = 192

function drawWindow(ctx: CanvasRenderingContext2D, scene: ShinomasScene) {
  const img = scene.windowImage
  if (!img) return
  const { width: W, height: H } = scene
  const u = unit(W)
  const sw = img.naturalWidth || (img.width as number)
  const sh = img.naturalHeight || (img.height as number)
  if (!sw || !sh) return

  const capW = WIN_W * u
  const capH = WIN_H * u
  const left = WIN_X * u
  const right = W - WIN_X * u
  const y = H - WIN_TOP_FROM_BOTTOM * u

  ctx.drawImage(img, left, y, capW, capH)

  const midW = right - capW * 2 - left
  if (midW > 0) {
    ctx.drawImage(img, sw - 1, 0, 1, sh, left + capW, y, midW, capH)
  }

  ctx.save()
  ctx.translate(right, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(img, 0, y, capW, capH)
  ctx.restore()
}

// -------------------------------------------------------------- 上部ボタン

// adv_btn01 / adv_btn02 はどちらも 240x120 の横 2 分割アトラス。
// 左 120x120 が早送り（>> / ⏸）、右 120x120 がセリフログの吹き出し。
const ATLAS_CELL = 120
const BTN_SIZE = 120
const BTN_Y = 10
const BTN_LOG_X = 50
/** 早送りボタン右端の、画面右端からの距離。ログボタンと左右対称になる */
const BTN_SKIP_FROM_RIGHT = 50

function drawAtlasButton(ctx: CanvasRenderingContext2D, scene: ShinomasScene, kind: 'log' | 'skip') {
  const atlas = scene.buttonAtlas
  if (!atlas) return
  const u = unit(scene.width)
  const size = BTN_SIZE * u
  const x =
    kind === 'log' ? BTN_LOG_X * u : scene.width - (BTN_SKIP_FROM_RIGHT + BTN_SIZE) * u
  const sx = kind === 'log' ? ATLAS_CELL : 0
  ctx.drawImage(atlas, sx, 0, ATLAS_CELL, ATLAS_CELL, x, BTN_Y * u, size, size)
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
const NEXT_X = 1668
const NEXT_TOP_FROM_BOTTOM = 109
const NEXT_W = 56
const NEXT_H = 64

function drawNext(ctx: CanvasRenderingContext2D, scene: ShinomasScene) {
  const img = scene.nextImage
  if (!img) return
  const { width: W, height: H } = scene
  const u = unit(W)
  // 画面右端からの距離で持ち、4:3 でもウィンドウ右端との関係が崩れないようにする
  const x = W - (REF_W - NEXT_X) * u
  ctx.drawImage(img, x, H - NEXT_TOP_FROM_BOTTOM * u, NEXT_W * u, NEXT_H * u)
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
