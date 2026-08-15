import { useState, useEffect, useRef, useMemo } from 'hono/jsx'
import {
  MAX_LINES,
  TALK_DIALOGUE_FONT_FAMILY,
  renderTalkScene,
  talkCanvasSize,
  type TalkAspect,
} from '../lib/talk/renderTalk'
import { findLogo, logoIdForCharacterTeam, talkLogos } from '../lib/talk/logos'
import WaveFooter from '../components/layout/WaveFooter'
import { dolphinCharacters } from '../lib/nine/dolphinCharacters'
import { useTalkEditor } from '../features/talk/useTalkEditor'
import { useCanvasGesture } from '../features/talk/useCanvasGesture'

const FONT_LINK_ID = 'dolphin-talk-font'
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700;900&display=swap'

/** 写真で覆われない部分の色。 */
const BACKGROUND = '#8ec5e8'

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
  showPlate: true,
  showMenu: true,
  showSkip: true,
  showNext: true,
}

export default function DolphinTalkClient() {
  const [fontReady, setFontReady] = useState(false)

  const editor = useTalkEditor({ downloadName: 'dolphin-wave-talk.png' })
  const { layers, selectedId, selected, canvasRef, updateLayer } = editor
  const [name, setName] = useState(INITIAL.name)
  const [logoId, setLogoId] = useState<string | null>(INITIAL.logoId)
  const [text, setText] = useState(INITIAL.text)
  const [aspect, setAspect] = useState<TalkAspect>(INITIAL.aspect)
  const [showPlate, setShowPlate] = useState(INITIAL.showPlate)
  const [showMenu, setShowMenu] = useState(INITIAL.showMenu)
  const [showSkip, setShowSkip] = useState(INITIAL.showSkip)
  const [showNext, setShowNext] = useState(INITIAL.showNext)

  // ロゴ画像は読み込み後に再描画が要るので、キャッシュと再描画トリガーを持つ
  const logoCache = useRef<Map<string, HTMLImageElement>>(new Map())
  const [logoRev, setLogoRev] = useState(0)
  const canvasHandlers = useCanvasGesture({ canvasRef, selected, updateLayer })

  const size = talkCanvasSize(aspect)
  const lines = useMemo(() => text.split('\n').slice(0, MAX_LINES), [text])
  const isPristine =
    layers.length === 0 &&
    name === INITIAL.name &&
    logoId === INITIAL.logoId &&
    text === INITIAL.text &&
    aspect === INITIAL.aspect &&
    showPlate === INITIAL.showPlate &&
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
      background: BACKGROUND,
      layers,
      name,
      logo,
      lines,
      showPlate,
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
    showPlate,
    showMenu,
    showSkip,
    showNext,
    fontReady,
    size.width,
    size.height,
  ])

  const handleReset = () => {
    editor.clearLayers()
    setName(INITIAL.name)
    setLogoId(INITIAL.logoId)
    setText(INITIAL.text)
    setAspect(INITIAL.aspect)
    setShowPlate(INITIAL.showPlate)
    setShowMenu(INITIAL.showMenu)
    setShowSkip(INITIAL.showSkip)
    setShowNext(INITIAL.showNext)
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
              {...canvasHandlers}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={editor.download}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              画像を保存
            </button>
            <button
              onClick={editor.openPicker}
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
                className={`flex h-11 w-16 items-center justify-center rounded-md border bg-white text-[10px] font-semibold text-slate-500 ${
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
                  className={`flex h-11 w-16 items-center justify-center rounded-md border bg-white p-1 ${
                    logoId === l.id ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-slate-200'
                  }`}
                >
                  <img src={l.src} alt="" className="max-h-full max-w-full min-w-0 object-contain" />
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
                        onClick={() => editor.selectLayer(layer.id)}
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
                        onClick={() => editor.moveLayer(layer.id, 1)}
                        aria-label="前面へ"
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => editor.moveLayer(layer.id, -1)}
                        aria-label="背面へ"
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => editor.removeLayer(layer.id)}
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
                          onClick={() => editor.centerLayer(layer.id)}
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
                ['ネームプレート', showPlate, setShowPlate],
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

        {/* 権利表記はフッターにあるので、ここはツール固有の注意書きだけにする */}
        <p className="mt-6 text-xs leading-relaxed text-slate-500">
          本ツールは個人が作成した非公式のファンメイドです。
          読み込んだ画像はブラウザ内だけで処理され、サーバーには送信されません。
          生成した画像の取り扱いは、各権利者のガイドラインに従ってください。
        </p>
        </div>
      </main>
      <WaveFooter />
    </div>
  )
}
