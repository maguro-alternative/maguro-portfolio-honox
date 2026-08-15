import { useState, useEffect, useMemo } from 'hono/jsx'
import {
  MAX_LINES,
  SHINOMAS_FONT_FAMILY,
  SHINOMAS_FONT_WEIGHT,
  renderShinomasScene,
  talkCanvasSize,
  type TalkAspect,
} from '../lib/talk/renderShinomasTalk'
import { findShinomasEmblem, shinomasEmblems } from '../lib/talk/shinomasEmblems'
import { useTalkEditor } from '../features/talk/useTalkEditor'
import { useCanvasGesture } from '../features/talk/useCanvasGesture'

const FONT_LINK_ID = 'shinomas-talk-font'
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap'

/** 写真で覆われない部分の色。参照スクショも黒背景。 */
const BACKGROUND = '#000000'

let talkFontPromise: Promise<void> | null = null

/**
 * Canvas は Web フォントの読み込み完了を待たないと、素のフォールバック書体で焼き込まれる。
 * マウント時だけの useEffect は hono/jsx で走らないことがあるため、
 * 実際に描画する側（キャンバスの effect）から毎回呼べる形にしている。
 */
function ensureTalkFont(): Promise<void> {
  if (talkFontPromise) return talkFontPromise

  if (!document.getElementById(FONT_LINK_ID)) {
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = 'https://fonts.gstatic.com'
    preconnect.crossOrigin = ''
    document.head.appendChild(preconnect)

    const link = document.createElement('link')
    link.id = FONT_LINK_ID
    link.rel = 'stylesheet'
    link.href = FONT_HREF
    document.head.appendChild(link)
  }

  // 描画に使うのと同じウェイト指定で待たないと、可変フォントの別インスタンスを待ってしまう
  const sample = 'あアｱ亜A1！'
  talkFontPromise = Promise.all(
    [46, 40, 20].map((size) =>
      document.fonts.load(`${SHINOMAS_FONT_WEIGHT} ${size}px "Noto Sans JP"`, sample)
    )
  ).then(
    () => undefined,
    () => undefined
  )
  return talkFontPromise
}

// エンブレム画像はページをまたいで使い回す。読み込み完了で再描画させるため、
// 呼び出し側から再描画用のコールバックを受け取る。
// （ウィンドウ・ボタン・▽ は画像を使わず renderShinomasTalk 側で描いている）
const spriteCache = new Map<string, HTMLImageElement>()

function getSprite(src: string | null, onLoad: () => void): HTMLImageElement | null {
  if (!src) return null
  const cached = spriteCache.get(src)
  if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null
  const img = new Image()
  img.onload = onLoad
  img.src = src
  spriteCache.set(src, img)
  return null
}

// 初期値はリセット処理と共有する
const INITIAL = {
  name: '',
  emblemId: 'hanzo' as string | null,
  text: '',
  aspect: '16:9' as TalkAspect,
  showName: true,
  showLog: true,
  showSkip: true,
  showNext: true,
}

export default function ShinomasTalkClient() {
  const [fontReady, setFontReady] = useState(false)

  const editor = useTalkEditor({ downloadName: 'shinomas-talk.png' })
  const { layers, selectedId, selected, canvasRef, updateLayer } = editor
  const [name, setName] = useState(INITIAL.name)
  const [emblemId, setEmblemId] = useState<string | null>(INITIAL.emblemId)
  const [text, setText] = useState(INITIAL.text)
  const [aspect, setAspect] = useState<TalkAspect>(INITIAL.aspect)
  const [showName, setShowName] = useState(INITIAL.showName)
  const [showLog, setShowLog] = useState(INITIAL.showLog)
  const [showSkip, setShowSkip] = useState(INITIAL.showSkip)
  const [showNext, setShowNext] = useState(INITIAL.showNext)

  // UI 素材は読み込み後に再描画が要るので、再描画トリガーを持つ
  const [spriteRev, setSpriteRev] = useState(0)
  const canvasHandlers = useCanvasGesture({ canvasRef, selected, updateLayer })

  const size = talkCanvasSize(aspect)
  const lines = useMemo(() => text.split('\n').slice(0, MAX_LINES), [text])
  const isPristine =
    layers.length === 0 &&
    name === INITIAL.name &&
    emblemId === INITIAL.emblemId &&
    text === INITIAL.text &&
    aspect === INITIAL.aspect &&
    showName === INITIAL.showName &&
    showLog === INITIAL.showLog &&
    showSkip === INITIAL.showSkip &&
    showNext === INITIAL.showNext

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = size.width
    canvas.height = size.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Web フォントの読み込みもここから確実に走らせ、完了したら再描画させる
    if (!fontReady) void ensureTalkFont().then(() => setFontReady(true))

    const bump = () => setSpriteRev((v) => v + 1)
    const emblem = findShinomasEmblem(emblemId)

    renderShinomasScene(ctx, {
      width: size.width,
      height: size.height,
      background: BACKGROUND,
      layers,
      name,
      emblem: getSprite(emblem?.src ?? null, bump),
      lines,
      showName,
      showLog,
      showSkip,
      showNext,
    })
  }, [
    layers,
    name,
    emblemId,
    lines,
    aspect,
    showName,
    showLog,
    showSkip,
    showNext,
    fontReady,
    spriteRev,
    size.width,
    size.height,
  ])

  const handleReset = () => {
    editor.clearLayers()
    setName(INITIAL.name)
    setEmblemId(INITIAL.emblemId)
    setText(INITIAL.text)
    setAspect(INITIAL.aspect)
    setShowName(INITIAL.showName)
    setShowLog(INITIAL.showLog)
    setShowSkip(INITIAL.showSkip)
    setShowNext(INITIAL.showNext)
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-gradient-to-r from-black via-red-950 to-black px-4 py-4 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold tracking-widest text-red-300">
            SHINOBI MASTER SENRAN KAGURA NEW LINK
          </p>
          <h1 className="mt-0.5 text-xl font-bold sm:text-2xl">シノマス セリフメーカー</h1>
          <p className="mt-0.5 text-sm text-white/80">
            好きな画像を、シノマスの会話画面風に仕上げられます。
          </p>
        </div>
      </header>

      {/* プレビューを見ながら編集できるよう、広い画面は2カラム、狭い画面はプレビューを上部に固定する */}
      <main className="mx-auto max-w-7xl px-4 pb-16 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-6">
        <div className="sticky top-0 z-10 -mx-4 border-b border-slate-700 bg-slate-900 px-4 pb-3 pt-3 lg:top-4 lg:mx-0 lg:border-b-0 lg:px-0">
          <div className="-mx-4 overflow-hidden bg-black shadow-md sm:mx-0 sm:rounded-lg">
            <canvas
              ref={canvasRef}
              aria-label="会話画面のプレビュー"
              className="mx-auto block max-h-[38vh] w-auto max-w-full lg:max-h-[calc(100vh-13rem)]"
              style={{ touchAction: 'none', cursor: selected ? 'move' : 'default' }}
              {...canvasHandlers}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={editor.download}
              className="rounded-lg bg-red-700 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-600"
            >
              画像を保存
            </button>
            <button
              onClick={editor.openPicker}
              className="rounded-lg border border-slate-600 bg-slate-800 px-5 py-2 text-sm font-bold text-slate-100 shadow-sm transition-colors hover:bg-slate-700"
            >
              写真を追加
            </button>
            <button
              onClick={handleReset}
              disabled={isPristine}
              className="ml-auto rounded-lg bg-slate-700 px-5 py-2 text-sm font-bold text-slate-100 shadow-sm transition-colors hover:bg-slate-600 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600"
            >
              リセット
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {selected
              ? '選択中の写真をドラッグで移動、ホイール／ピンチで拡大縮小できます。'
              : '写真を追加すると、ドラッグで位置を調整できるようになります。'}
          </p>
        </div>

        <div className="pt-4">
          <section className="space-y-4 rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-sm">
            <label className="block">
              <span className="text-xs font-semibold text-slate-300">名前</span>
              <input
                type="text"
                value={name}
                placeholder="飛鳥"
                autocomplete="off"
                onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)}
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </label>

            <div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-slate-300">所属（エンブレム）</span>
                <span className="truncate text-xs text-slate-400">
                  {findShinomasEmblem(emblemId)?.label ?? 'エンブレムなし'}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <button
                  onClick={() => setEmblemId(null)}
                  title="エンブレムなし"
                  aria-label="エンブレムなし"
                  aria-pressed={emblemId === null}
                  className={`flex h-11 w-11 items-center justify-center rounded-md border bg-slate-900 text-[10px] font-semibold text-slate-400 ${
                    emblemId === null ? 'border-red-500 ring-2 ring-red-500/40' : 'border-slate-600'
                  }`}
                >
                  なし
                </button>
                {shinomasEmblems.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setEmblemId(e.id)}
                    title={e.label}
                    aria-label={e.label}
                    aria-pressed={emblemId === e.id}
                    className={`flex h-11 w-11 items-center justify-center rounded-md border bg-slate-900 p-1 ${
                      emblemId === e.id ? 'border-red-500 ring-2 ring-red-500/40' : 'border-slate-600'
                    }`}
                  >
                    <img src={e.src} alt="" className="max-h-full min-w-0 max-w-full object-contain" />
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-slate-300">
                セリフ（改行で最大 {MAX_LINES} 行）
              </span>
              <textarea
                rows={3}
                value={text}
                placeholder={'先生からの力作、お待ちしてます！'}
                onInput={(e) => {
                  const v = (e.currentTarget as HTMLTextAreaElement).value
                  setText(v.split('\n').slice(0, MAX_LINES).join('\n'))
                }}
                className="mt-1 w-full resize-y rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-red-500 focus:outline-none"
                style={{ fontFamily: SHINOMAS_FONT_FAMILY }}
              />
            </label>
          </section>

          <section className="mt-4 space-y-3 rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-200">
              写真{' '}
              {layers.length > 0 && <span className="text-slate-400">（{layers.length}枚）</span>}
            </h2>

            {layers.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">
                「写真を追加」から画像を読み込んでください
              </p>
            ) : (
              <ul className="space-y-2">
                {[...layers].reverse().map((layer) => {
                  const isSelected = layer.id === selectedId
                  return (
                    <li
                      key={layer.id}
                      className={`rounded-md border p-2 ${
                        isSelected ? 'border-red-500 bg-red-950/40' : 'border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editor.selectLayer(layer.id)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <img
                            src={layer.url}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded object-cover"
                          />
                          <span className="truncate text-xs text-slate-200">{layer.label}</span>
                        </button>
                        <button
                          onClick={() => editor.moveLayer(layer.id, 1)}
                          aria-label="前面へ"
                          className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => editor.moveLayer(layer.id, -1)}
                          aria-label="背面へ"
                          className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => editor.removeLayer(layer.id)}
                          aria-label="削除"
                          className="rounded border border-red-800 px-2 py-1 text-xs text-red-400 hover:bg-red-950"
                        >
                          ✕
                        </button>
                      </div>

                      {isSelected && (
                        <div className="mt-2 flex items-center gap-3">
                          <input
                            type="range"
                            min="0.15"
                            max="5"
                            step="0.01"
                            value={String(layer.zoom)}
                            onInput={(e) =>
                              updateLayer(layer.id, {
                                zoom: Number((e.currentTarget as HTMLInputElement).value),
                              })
                            }
                            className="flex-1"
                          />
                          <button
                            onClick={() => editor.centerLayer(layer.id)}
                            className="shrink-0 rounded border border-slate-600 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700"
                          >
                            中央に戻す
                          </button>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="mt-4 space-y-3 rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-200">画面設定</h2>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">画面比率</span>
              <div className="flex overflow-hidden rounded-md border border-slate-600">
                {(['16:9', '4:3'] as TalkAspect[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAspect(a)}
                    className={`px-4 py-1.5 text-xs font-semibold ${
                      aspect === a ? 'bg-red-700 text-white' : 'bg-slate-900 text-slate-300'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {(
                [
                  ['名前欄', showName, setShowName],
                  ['ログボタン', showLog, setShowLog],
                  ['早送りボタン', showSkip, setShowSkip],
                  ['送りマーク ▽', showNext, setShowNext],
                ] as [string, boolean, (v: boolean) => void][]
              ).map(([label, value, setter]) => (
                <label key={label} className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setter((e.currentTarget as HTMLInputElement).checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          {/* 権利表記はフッターにあるので、ここはツール固有の注意書きだけにする */}
          <p className="mt-6 text-xs leading-relaxed text-slate-400">
            本ツールは個人が作成した非公式のファンメイドです。
            読み込んだ画像はブラウザ内だけで処理され、サーバーには送信されません。
            生成した画像の取り扱いは、各権利者のガイドラインに従ってください。
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function SiteFooter() {
  return (
    <div className="w-full">
      <div className="relative z-10 flex flex-col items-center justify-center gap-1 bg-black py-3 pointer-events-auto select-text">
        <p className="pointer-events-auto text-center text-sm text-white">
          &copy; 2026 Maguro Alternative. All rights reserved.
        </p>
        <p className="pointer-events-auto text-center text-sm text-white">
          作者のTwitter:{' '}
          <a
            href="https://twitter.com/sigumataityouda"
            className="text-gray-300 hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            @sigumataityouda
          </a>
          ,{' '}
          <a
            href="https://twitter.com/maguro_alterich"
            className="text-gray-300 hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            @maguro_alterich
          </a>
        </p>
        <p className="pointer-events-auto text-center text-sm text-white">
          画像：&copy;Marvelous Inc. &copy;HONEY PARADE GAMES Inc.
        </p>
      </div>
    </div>
  )
}
