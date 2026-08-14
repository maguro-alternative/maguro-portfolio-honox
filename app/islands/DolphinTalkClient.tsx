import { useState, useEffect, useRef, useMemo } from 'hono/jsx'
import {
  MAX_LINES,
  TALK_DIALOGUE_FONT_FAMILY,
  renderTalkScene,
  talkCanvasSize,
  type TalkAspect,
  type TalkLayer,
} from '../lib/talk/renderTalk'
import { findLogo, logoIdForCharacterTeam, talkLogos } from '../lib/talk/logos'
import { dolphinCharacters } from '../lib/nine/dolphinCharacters'

interface PhotoLayer extends TalkLayer {
  url: string
  label: string
}

const FONT_LINK_ID = 'dolphin-talk-font'
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700;800;900&display=swap'

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

  const sample = 'あアｱ亜A1！'
  talkFontPromise = Promise.all([
    document.fonts.load(`700 54px "Noto Sans JP"`, sample),
    document.fonts.load(`800 54px "Noto Sans JP"`, sample),
    document.fonts.load(`900 54px "Noto Sans JP"`, sample),
  ]).then(
    () => undefined,
    () => undefined
  )
  return talkFontPromise
}

// 初期値はリセット処理と共有する
const INITIAL = {
  name: '',
  logoId: 'kirishima' as string | null,
  text: '',
  aspect: '16:9' as TalkAspect,
  background: '#8ec5e8',
  showMenu: true,
  showSkip: true,
  showNext: true,
}

let layerSeq = 0

function loadFile(file: File): Promise<PhotoLayer> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () =>
      resolve({
        id: `layer-${++layerSeq}`,
        label: file.name.replace(/\.[^.]+$/, ''),
        url,
        image,
        offX: 0,
        offY: 0,
        zoom: 1,
      })
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('画像を読み込めませんでした'))
    }
    image.src = url
  })
}

export default function DolphinTalkClient() {
  const [fontReady, setFontReady] = useState(false)

  const [layers, setLayers] = useState<PhotoLayer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [name, setName] = useState(INITIAL.name)
  const [logoId, setLogoId] = useState<string | null>(INITIAL.logoId)
  const [text, setText] = useState(INITIAL.text)
  const [aspect, setAspect] = useState<TalkAspect>(INITIAL.aspect)
  const [background, setBackground] = useState(INITIAL.background)
  const [showMenu, setShowMenu] = useState(INITIAL.showMenu)
  const [showSkip, setShowSkip] = useState(INITIAL.showSkip)
  const [showNext, setShowNext] = useState(INITIAL.showNext)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  // ロゴ画像は読み込み後に再描画が要るので、キャッシュと再描画トリガーを持つ
  const logoCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const [logoRev, setLogoRev] = useState(0)
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const gesture = useRef<{
    mode: 'drag' | 'pinch'
    layerId: string
    startOffX: number
    startOffY: number
    startZoom: number
    startX: number
    startY: number
    startDist: number
  } | null>(null)

  const size = talkCanvasSize(aspect)
  const lines = useMemo(() => text.split('\n').slice(0, MAX_LINES), [text])
  const selected = layers.find((l) => l.id === selectedId) ?? null
  const isPristine =
    layers.length === 0 &&
    name === INITIAL.name &&
    logoId === INITIAL.logoId &&
    text === INITIAL.text &&
    aspect === INITIAL.aspect &&
    background === INITIAL.background &&
    showMenu === INITIAL.showMenu &&
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

    // 未読み込みのロゴはここで読み込み、完了したら再描画させる
    const cache = logoCache.current
    let logo: HTMLImageElement | null = null
    const def = findLogo(logoId)
    if (def && cache) {
      const cached = cache.get(def.id)
      if (cached) {
        logo = cached.complete && cached.naturalWidth > 0 ? cached : null
      } else {
        const img = new Image()
        img.onload = () => setLogoRev((v) => v + 1)
        img.src = def.src
        cache.set(def.id, img)
      }
    }

    renderTalkScene(ctx, {
      width: size.width,
      height: size.height,
      background,
      layers,
      name,
      logo,
      lines,
      showMenu,
      showSkip,
      showNext,
    })
  }, [
    layers,
    name,
    logoId,
    logoRev,
    lines,
    aspect,
    background,
    showMenu,
    showSkip,
    showNext,
    fontReady,
    size.width,
    size.height,
  ])

  const updateLayer = (id: string, patch: Partial<PhotoLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  // hono/jsx の onChange は input イベントに割り当てられ file input と相性が悪いので、
  // 隠し input を JSX に置かず、クリックのたびに使い捨ての input を作って change を拾う。
  const openPicker = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => void handleFiles(input.files)
    input.click()
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const loaded: PhotoLayer[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      try {
        loaded.push(await loadFile(file))
      } catch {
        // 読めない画像は黙って飛ばす
      }
    }
    if (loaded.length === 0) return
    setLayers((prev) => [...prev, ...loaded])
    setSelectedId(loaded[loaded.length - 1].id)
  }

  const handleRemove = (id: string) => {
    setLayers((prev) => {
      const target = prev.find((l) => l.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((l) => l.id !== id)
    })
    setSelectedId((prev) => (prev === id ? null : prev))
  }

  const handleMove = (id: string, dir: -1 | 1) => {
    setLayers((prev) => {
      const i = prev.findIndex((l) => l.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  const handleCenter = (id: string) => {
    updateLayer(id, { offX: 0, offY: 0, zoom: 1 })
  }

  const handleReset = () => {
    setLayers((prev) => {
      for (const layer of prev) URL.revokeObjectURL(layer.url)
      return []
    })
    setSelectedId(null)
    setName(INITIAL.name)
    setLogoId(INITIAL.logoId)
    setText(INITIAL.text)
    setAspect(INITIAL.aspect)
    setBackground(INITIAL.background)
    setShowMenu(INITIAL.showMenu)
    setShowSkip(INITIAL.showSkip)
    setShowNext(INITIAL.showNext)
  }

  // ---------------------------------------------------------- キャンバス操作

  const canvasPointFromEvent = (e: PointerEvent) => ({ x: e.clientX, y: e.clientY })

  const onPointerDown = (e: PointerEvent) => {
    const canvas = canvasRef.current
    const active = pointers.current
    if (!canvas || !active || !selected) return
    canvas.setPointerCapture(e.pointerId)
    active.set(e.pointerId, canvasPointFromEvent(e))

    const pts = Array.from(active.values())
    if (pts.length === 1) {
      gesture.current = {
        mode: 'drag',
        layerId: selected.id,
        startOffX: selected.offX,
        startOffY: selected.offY,
        startZoom: selected.zoom,
        startX: pts[0].x,
        startY: pts[0].y,
        startDist: 0,
      }
    } else if (pts.length === 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      gesture.current = {
        mode: 'pinch',
        layerId: selected.id,
        startOffX: selected.offX,
        startOffY: selected.offY,
        startZoom: selected.zoom,
        startX: (pts[0].x + pts[1].x) / 2,
        startY: (pts[0].y + pts[1].y) / 2,
        startDist: dist,
      }
    }
  }

  const onPointerMove = (e: PointerEvent) => {
    const canvas = canvasRef.current
    const g = gesture.current
    const active = pointers.current
    if (!canvas || !g || !active || !active.has(e.pointerId)) return
    active.set(e.pointerId, canvasPointFromEvent(e))
    const rect = canvas.getBoundingClientRect()
    const pts = Array.from(active.values())

    if (g.mode === 'pinch' && pts.length >= 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const zoom = clamp(g.startZoom * (dist / (g.startDist || dist)), 0.15, 5)
      updateLayer(g.layerId, { zoom })
      return
    }

    const dx = (pts[0].x - g.startX) / rect.width
    const dy = (pts[0].y - g.startY) / rect.height
    updateLayer(g.layerId, { offX: g.startOffX + dx, offY: g.startOffY + dy })
  }

  const onPointerUp = (e: PointerEvent) => {
    const active = pointers.current
    if (!active) return
    active.delete(e.pointerId)
    if (active.size === 0) gesture.current = null
  }

  const onWheel = (e: WheelEvent) => {
    if (!selected) return
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.06 : 1 / 1.06
    updateLayer(selected.id, { zoom: clamp(selected.zoom * factor, 0.15, 5) })
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dolphin-wave-talk.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  // 名前欄に公式キャラ名が入ったらロゴを自動で合わせる
  const handleNameInput = (value: string) => {
    setName(value)
    const hit = dolphinCharacters.find(
      (c) => c.name === value || c.name.replace(/\s/g, '') === value.replace(/\s/g, '')
    )
    if (hit) {
      const id = logoIdForCharacterTeam(hit.team)
      if (id && findLogo(id)) setLogoId(id)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-blue-500 px-4 py-4 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold tracking-widest">DOLPHIN WAVE</p>
          <h1 className="mt-0.5 text-xl font-bold sm:text-2xl">
            ドルフィンウェーブ セリフメーカー
          </h1>
          <p className="mt-0.5 text-sm text-white/90">
            好きな画像を、ドルフィンウェーブの会話画面風に仕上げられます。
          </p>
        </div>
      </header>

      {/* プレビューを見ながら編集できるよう、広い画面は2カラム、狭い画面はプレビューを上部に固定する */}
      <main className="mx-auto max-w-7xl px-4 pb-16 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-6">
        <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-slate-100 px-4 pb-3 pt-3 lg:top-4 lg:mx-0 lg:border-b-0 lg:px-0">
          <div className="-mx-4 overflow-hidden bg-black shadow-md sm:mx-0 sm:rounded-lg">
            <canvas
              ref={canvasRef}
              aria-label="会話画面のプレビュー"
              className="mx-auto block max-h-[38vh] w-auto max-w-full lg:max-h-[calc(100vh-13rem)]"
              style={{ touchAction: 'none', cursor: selected ? 'move' : 'default' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownload}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              画像を保存
            </button>
            <button
              onClick={openPicker}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              写真を追加
            </button>
            <button
              onClick={handleReset}
              disabled={isPristine}
              className="ml-auto rounded-lg bg-slate-200 px-5 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
            >
              リセット
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {selected
              ? '選択中の写真をドラッグで移動、ホイール／ピンチで拡大縮小できます。'
              : '写真を追加すると、ドラッグで位置を調整できるようになります。'}
          </p>
        </div>

        <div className="pt-4">
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">テキスト</h2>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">名前</span>
            <input
              type="text"
              value={name}
              placeholder="小針"
              autocomplete="off"
              onInput={(e) => handleNameInput((e.currentTarget as HTMLInputElement).value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>

          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600">チーム（ロゴ）</span>
              <span className="truncate text-xs text-slate-400">
                {findLogo(logoId)?.label ?? 'ロゴなし'}
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <button
                onClick={() => setLogoId(null)}
                title="ロゴなし"
                aria-label="ロゴなし"
                aria-pressed={logoId === null}
                className={`flex h-11 w-11 items-center justify-center rounded-md border bg-white text-[10px] font-semibold text-slate-500 ${
                  logoId === null ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-200'
                }`}
              >
                なし
              </button>
              {talkLogos.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLogoId(l.id)}
                  title={l.label}
                  aria-label={l.label}
                  aria-pressed={logoId === l.id}
                  className={`flex h-11 w-11 items-center justify-center rounded-md border bg-white p-1 ${
                    logoId === l.id ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-200'
                  }`}
                >
                  <img src={l.src} alt="" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-slate-600">
              セリフ（改行で最大 {MAX_LINES} 行）
            </span>
            <textarea
              rows={3}
              value={text}
              placeholder={'そ、そうだ！　今日抜き打ちのテストがあったんです！\n出題範囲広めで苦労しちゃって……！'}
              onInput={(e) => {
                const v = (e.currentTarget as HTMLTextAreaElement).value
                setText(v.split('\n').slice(0, MAX_LINES).join('\n'))
              }}
              className="mt-1 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              style={{ fontFamily: TALK_DIALOGUE_FONT_FAMILY }}
            />
          </label>
        </section>

        <section className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">
            写真 {layers.length > 0 && <span className="text-slate-400">（{layers.length}枚）</span>}
          </h2>

          {layers.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">
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
                      isSelected ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedId(layer.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <img
                          src={layer.url}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded object-cover"
                        />
                        <span className="truncate text-xs text-slate-700">{layer.label}</span>
                      </button>
                      <button
                        onClick={() => handleMove(layer.id, 1)}
                        aria-label="前面へ"
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMove(layer.id, -1)}
                        aria-label="背面へ"
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => handleRemove(layer.id)}
                        aria-label="削除"
                        className="rounded border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50"
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
                          onClick={() => handleCenter(layer.id)}
                          className="shrink-0 rounded border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
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

        <section className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700">画面設定</h2>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">画面比率</span>
            <div className="flex overflow-hidden rounded-md border border-slate-300">
              {(['16:9', '4:3'] as TalkAspect[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAspect(a)}
                  className={`px-4 py-1.5 text-xs font-semibold ${
                    aspect === a ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'
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
                ['メニューボタン', showMenu, setShowMenu],
                ['スキップボタン', showSkip, setShowSkip],
                ['送りマーク ▽', showNext, setShowNext],
              ] as [string, boolean, (v: boolean) => void][]
            ).map(([label, value, setter]) => (
              <label key={label} className="flex items-center gap-2 text-xs text-slate-600">
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

        <p className="mt-6 text-xs leading-relaxed text-slate-500">
          本ツールは個人が作成した非公式のファンメイドです。ドルフィンウェーブの権利は
          &copy;Marvelous Inc. &copy;HONEY PARADE GAMES Inc. に帰属します。
          読み込んだ画像はブラウザ内だけで処理され、サーバーには送信されません。
          生成した画像の取り扱いは、各権利者のガイドラインに従ってください。
        </p>
        </div>
      </main>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
