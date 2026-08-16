import { useState, useEffect, useMemo } from 'hono/jsx'
import MakerTerms from '../components/layout/MakerTerms'
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
import { ensureTalkFont, type TalkFontConfig } from '../features/talk/talkFont'
import { getSprite } from '../features/talk/spriteCache'
import { shinomasTheme } from '../features/talk/theme'
import BadgePicker from '../features/talk/parts/BadgePicker'
import LayerList from '../features/talk/parts/LayerList'
import ScreenSettings from '../features/talk/parts/ScreenSettings'

/** 写真で覆われない部分の色。参照スクショも黒背景。 */
const BACKGROUND = '#000000'

const FONT: TalkFontConfig = {
  linkId: 'shinomas-talk-font',
  href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap',
  family: '"Noto Sans JP"',
  faces: [46, 40, 20].map((size) => ({ weight: SHINOMAS_FONT_WEIGHT, size })),
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
  const { layers, selected, canvasRef, updateLayer } = editor
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
    if (!fontReady) void ensureTalkFont(FONT).then(() => setFontReady(true))

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
          <section className={`space-y-4 ${shinomasTheme.panel}`}>
            <label className="block">
              <span className={shinomasTheme.label}>名前</span>
              <input
                type="text"
                value={name}
                placeholder="飛鳥"
                autocomplete="off"
                onInput={(e) => setName((e.currentTarget as HTMLInputElement).value)}
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-red-500 focus:outline-none"
              />
            </label>

            <BadgePicker
              label="所属（エンブレム）"
              noneLabel="エンブレムなし"
              items={shinomasEmblems}
              value={emblemId}
              onChange={setEmblemId}
              swatchSize="h-11 w-11"
              theme={shinomasTheme}
            />

            <label className="block">
              <span className={shinomasTheme.label}>
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

          <LayerList editor={editor} theme={shinomasTheme} />

          <ScreenSettings
            aspect={aspect}
            onAspectChange={setAspect}
            toggles={[
              { label: '名前欄', value: showName, onChange: setShowName },
              { label: 'ログボタン', value: showLog, onChange: setShowLog },
              { label: '早送りボタン', value: showSkip, onChange: setShowSkip },
              { label: '送りマーク ▽', value: showNext, onChange: setShowNext },
            ]}
            theme={shinomasTheme}
          />

          {/* 権利表記はフッターにあるので、ここは利用規約だけ置く */}
          <MakerTerms className="border-slate-700 bg-slate-800/50 text-slate-400" />
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
