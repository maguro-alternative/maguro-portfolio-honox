import { useState, useEffect, useMemo } from 'hono/jsx'
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
import { ensureTalkFont, type TalkFontConfig } from '../features/talk/talkFont'
import { getSprite } from '../features/talk/spriteCache'
import { dolphinTheme } from '../features/talk/theme'
import BadgePicker from '../features/talk/parts/BadgePicker'
import LayerList from '../features/talk/parts/LayerList'
import ScreenSettings from '../features/talk/parts/ScreenSettings'

/** 写真で覆われない部分の色。 */
const BACKGROUND = '#8ec5e8'

const FONT: TalkFontConfig = {
  linkId: 'dolphin-talk-font',
  href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700;900&display=swap',
  family: '"Noto Sans JP"',
  faces: [
    { weight: 700, size: 54 },
    { weight: 900, size: 54 },
  ],
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
  const { layers, selected, canvasRef, updateLayer } = editor
  const [name, setName] = useState(INITIAL.name)
  const [logoId, setLogoId] = useState<string | null>(INITIAL.logoId)
  const [text, setText] = useState(INITIAL.text)
  const [aspect, setAspect] = useState<TalkAspect>(INITIAL.aspect)
  const [showPlate, setShowPlate] = useState(INITIAL.showPlate)
  const [showMenu, setShowMenu] = useState(INITIAL.showMenu)
  const [showSkip, setShowSkip] = useState(INITIAL.showSkip)
  const [showNext, setShowNext] = useState(INITIAL.showNext)

  // ロゴ画像は読み込み後に再描画が要るので、再描画トリガーを持つ
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
    if (!fontReady) void ensureTalkFont(FONT).then(() => setFontReady(true))

    const bump = () => setLogoRev((v) => v + 1)
    const logo = getSprite(findLogo(logoId)?.src ?? null, bump)

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
        <section className={`space-y-4 ${dolphinTheme.panel}`}>
          <label className="block">
            <span className={dolphinTheme.label}>名前</span>
            <input
              type="text"
              value={name}
              placeholder="小針"
              autocomplete="off"
              onInput={(e) => handleNameInput((e.currentTarget as HTMLInputElement).value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>

          <BadgePicker
            label="チーム（ロゴ）"
            noneLabel="ロゴなし"
            items={talkLogos}
            value={logoId}
            onChange={setLogoId}
            swatchSize="h-11 w-16"
            theme={dolphinTheme}
          />

          <label className="block">
            <span className={dolphinTheme.label}>
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

        <LayerList editor={editor} theme={dolphinTheme} />

        <ScreenSettings
          aspect={aspect}
          onAspectChange={setAspect}
          toggles={[
            { label: 'ネームプレート', value: showPlate, onChange: setShowPlate },
            { label: 'メニューボタン', value: showMenu, onChange: setShowMenu },
            { label: 'スキップボタン', value: showSkip, onChange: setShowSkip },
            { label: '送りマーク ▽', value: showNext, onChange: setShowNext },
          ]}
          theme={dolphinTheme}
        />

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
