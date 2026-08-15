import { useState } from 'hono/jsx'
import { dolphinCharacters } from '../lib/nine/dolphinCharacters'
import { generateCanvasImage } from '../lib/nine/canvasDownload'
import WaveFooter from '../components/layout/WaveFooter'
import { useNineSelection } from '../features/nine/useNineSelection'
import { slugParamsCodec } from '../features/nine/shareCodec'
import SelectionGrid from '../features/nine/parts/SelectionGrid'
import ShareTextSection from '../features/nine/parts/ShareTextSection'
import CharacterSearchModal from '../features/nine/parts/CharacterSearchModal'

const TITLE = '私を構成する9人のドルフィン'

function EmptyEntry() {
  return (
    <div className="absolute inset-2 flex flex-col items-center justify-center gap-1 rounded border border-dashed border-slate-300 group-hover:border-slate-400">
      <svg className="h-10 w-10 text-red-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11 2h2v9h9v2h-9v9h-2v-9H2v-2h9z" />
      </svg>
      <span className="text-xs font-bold tracking-widest text-slate-500">ENTRY</span>
    </div>
  )
}

function WaveBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10">
      <div className="h-40 bg-blue-500" />
      <div className="relative -mt-1 h-24 overflow-hidden">
        <svg className="absolute top-0 h-full w-[200%] animate-wave-slow" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,20 C90,50 270,50 360,20 C450,-10 630,-10 720,20 C810,50 990,50 1080,20 C1170,-10 1350,-10 1440,20 L1440,0 L0,0 Z" fill="rgba(59,130,246,0.5)" />
        </svg>
        <svg className="absolute top-0 h-full w-[200%] animate-wave-mid" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,30 C90,60 270,60 360,30 C450,0 630,0 720,30 C810,60 990,60 1080,30 C1170,0 1350,0 1440,30 L1440,0 L0,0 Z" fill="rgba(96,165,250,0.3)" />
        </svg>
        <svg className="absolute top-0 h-full w-[200%] animate-wave-fast" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,40 C90,70 270,70 360,40 C450,10 630,10 720,40 C810,70 990,70 1080,40 C1170,10 1350,10 1440,40 L1440,0 L0,0 Z" fill="white" />
        </svg>
      </div>
    </div>
  )
}

export default function DolphinClient() {
  const nine = useNineSelection({
    characters: dolphinCharacters,
    pagePath: '/nine/dolphin',
    ogPath: '/api/og/dolphin',
    codec: slugParamsCodec,
    buildShareText: (url) => `${TITLE}\n#My9Dolphin #${TITLE}\n\n${url}`,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const [activePanelIndex, setActivePanelIndex] = useState(0)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const handlePanelClick = (index: number) => {
    setActivePanelIndex(index)
    setModalOpen(true)
  }

  const handleGenerate = async () => {
    try {
      setGeneratedImage(await generateCanvasImage(TITLE, nine.selectedItems, 'video'))
    } catch (err) {
      console.error('画像の生成に失敗しました', err)
      alert('画像の生成に失敗しました。')
    }
  }

  return (
    <div className="relative min-h-screen w-full">
      <WaveBackground />
      <header className="relative z-10 px-4 pb-16 pt-6">
        <div className="mx-auto max-w-lg">
          <p className="text-sm font-semibold tracking-widest text-white">
            9 DOLPHIN WAVE CHARACTERS
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">{TITLE}</h1>
          <p className="mt-1 text-sm text-white/90">
            9キャラクターを選んで一覧化し、画像として保存できます。
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">
            {nine.selectedCount} / 9 キャラ選択済み
          </p>
          <div className="flex gap-2">
            <button
              onClick={nine.randomize}
              className="rounded-md bg-indigo-500 px-3 py-1 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600"
            >
              ランダム
            </button>
            <button
              onClick={nine.reset}
              disabled={nine.selectedCount === 0}
              className="rounded-md bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
            >
              リセット
            </button>
          </div>
        </div>

        <SelectionGrid
          selectedItems={nine.selectedItems}
          onPanelClick={handlePanelClick}
          onClearPanel={nine.clearPanel}
          emptyClassName="group relative aspect-square w-full rounded-md border border-slate-300 bg-slate-100 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-200/70"
          renderEmpty={() => <EmptyEntry />}
        />

        <div className="mb-8 text-center">
          <button
            onClick={handleGenerate}
            disabled={nine.selectedCount < 9}
            className="rounded-lg bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            画像を作成
          </button>
        </div>

        {generatedImage && (
          <div className="mb-8">
            <img src={generatedImage} alt={TITLE} className="w-full rounded-lg shadow-md" />
          </div>
        )}

        <ShareTextSection
          shareText={nine.shareText}
          onCopy={nine.copyShareText}
          disabled={nine.selectedCount < 9}
        />

        <CharacterSearchModal
          isOpen={modalOpen}
          panelIndex={activePanelIndex}
          characters={dolphinCharacters}
          onSelect={(char) => nine.selectCharacter(activePanelIndex, char)}
          onClose={() => setModalOpen(false)}
        />
      </main>
      <WaveFooter />
    </div>
  )
}
