import { useState, useEffect } from 'hono/jsx'
import { kaguraCharacters } from '../lib/nine/kaguraCharacters'
import { generateCanvasImage } from '../lib/nine/canvasDownload'
import { useNineSelection } from '../features/nine/useNineSelection'
import { compactIndexCodec } from '../features/nine/shareCodec'
import SelectionGrid from '../features/nine/parts/SelectionGrid'
import ShareTextSection from '../features/nine/parts/ShareTextSection'
import CharacterSearchModal from '../features/nine/parts/CharacterSearchModal'

const TITLE = '私を構成する9人のシノビ少女'

function EmptySeal({ index }: { index: number }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="10" y="10" width="480" height="480" rx="40" ry="40" fill="#999" stroke="#333" strokeWidth="8" />
      <rect x="40" y="40" width="420" height="420" rx="5" ry="5" fill="none" stroke="#ccc" strokeWidth="4" opacity="0.5" />
      <circle cx="250" cy="250" r="180" fill="none" stroke="#666" strokeWidth="2" />
      <circle cx="250" cy="250" r="170" fill="none" stroke="#666" strokeWidth="5" />
      <defs>
        {/* textPath の参照先 id はページ内で衝突させられないので、スロット番号で分ける */}
        <path
          id={`textCircle-${index}`}
          d="M 250, 250 m -145, 0 a 145,145 0 1,1 290,0 a 145,145 0 1,1 -290,0"
        />
      </defs>
      <text fill="#444" fontFamily="Arial, sans-serif" fontSize="34" fontWeight="bold" letterSpacing="6">
        <textPath href={`#textCircle-${index}`} startOffset="50%" textAnchor="middle">
          SHINOVI MASTERS
        </textPath>
      </text>
      <g fill="#777" stroke="#444" strokeWidth="2" strokeLinejoin="round">
        <path d="M 250,90 L 275,225 L 410,250 L 275,275 L 250,410 L 225,275 L 90,250 L 225,225 Z" />
        <path d="M 250,90 V 410 M 90,250 H 410" stroke="#ccc" strokeWidth="1" opacity="0.5" />
      </g>
      <path d="M 250,380 C 230,380 215,410 215,430 C 215,445 235,450 250,440 C 265,450 285,445 285,430 C 285,410 270,380 250,380 Z" fill="#666" />
      <circle cx="250" cy="250" r="185" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

function SiteFooter() {
  return (
    <div className="w-full">
      <div className="relative z-10 flex flex-col items-center justify-center gap-1 bg-black py-3 pointer-events-auto select-text">
        <p className="pointer-events-auto text-center text-sm text-white">
          &copy; 2025 Maguro Alternative. All rights reserved.
        </p>
        <p className="pointer-events-auto text-center text-sm text-white">
          作者のTwitter:{' '}
          <a href="https://twitter.com/sigumataityouda" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">
            @sigumataityouda
          </a>
          ,{' '}
          <a href="https://twitter.com/maguro_alterich" className="text-gray-300 hover:text-white" target="_blank" rel="noopener noreferrer">
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

function SakuraEffect() {
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // tsparticles は重いので、初期バンドルに載せず動的に読む
        const { tsParticles } = await import('@tsparticles/engine')
        const { loadAll } = await import('@tsparticles/all')
        await loadAll(tsParticles)
        if (cancelled) return
        await tsParticles.load({
          id: 'sakura-particles',
          options: {
            particles: {
              number: { value: 40, density: { enable: true } },
              color: { value: ['#FFB7C5', '#FF91A4', '#DDA0DD', '#F4C2C2'] },
              shape: { type: 'circle' },
              opacity: { value: { min: 0.3, max: 0.7 } },
              size: { value: { min: 2, max: 8 } },
              move: {
                enable: true,
                speed: 2,
                direction: 'bottom',
                random: true,
                straight: false,
                outModes: 'out',
              },
              rotate: {
                value: { min: 0, max: 360 },
                animation: { enable: true, speed: 8, sync: false },
              },
              wobble: { enable: true, distance: 15, speed: 3 },
            },
            interactivity: {
              events: { onHover: { enable: false }, onClick: { enable: false } },
            },
            retina_detect: true,
          },
        })
      } catch (error) {
        console.error('Failed to load sakura particles:', error)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
        <div className="absolute left-[10%] animate-fall-small-9 text-lg opacity-60">🌸</div>
        <div className="absolute left-[30%] animate-fall-small-13 text-sm opacity-50">🌸</div>
        <div className="absolute left-[55%] animate-fall-medium-8 text-xl opacity-50">🌸</div>
        <div className="absolute left-[75%] animate-fall-medium-10 text-base opacity-60">🌸</div>
        <div className="absolute left-[20%] animate-fall-large-6 text-2xl opacity-40">🌸</div>
        <div className="absolute left-[65%] animate-fall-large-7 text-lg opacity-40">🌸</div>
        <div className="absolute left-[85%] animate-fall-small-7 text-sm opacity-50">🌸</div>
        <div className="absolute left-[45%] animate-fall-large-5 text-xl opacity-45">🌸</div>
      </div>
      <div id="sakura-particles" className="pointer-events-none fixed inset-0 z-10" />
    </>
  )
}

export default function KaguraClient() {
  const nine = useNineSelection({
    characters: kaguraCharacters,
    pagePath: '/nine/kagura',
    ogPath: '/api/og/kagura',
    codec: compactIndexCodec,
    buildShareText: (url) => `${TITLE}\n#My9Kagura #${TITLE}\n\n${url}`,
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
      setGeneratedImage(await generateCanvasImage(TITLE, nine.selectedItems, 'square'))
    } catch (err) {
      console.error('画像の生成に失敗しました', err)
      alert('画像の生成に失敗しました。')
    }
  }

  return (
    <div className="kagura-portal-bg relative min-h-screen w-full overflow-hidden">
      <div className="kagura-header-bg border-b-2 border-slate-400">
        <header className="mx-auto max-w-[700px] px-4 pb-4 pt-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">{TITLE}</h1>
          <p className="mt-1 text-sm text-slate-600">
            9人のシノビ少女を選んで一覧化し、画像として保存できます。
          </p>
        </header>
      </div>

      <main className="kagura-content-box">
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
          emptyClassName="relative aspect-square w-full overflow-hidden rounded-lg transition-opacity hover:opacity-80"
          renderEmpty={(index) => <EmptySeal index={index} />}
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
          characters={kaguraCharacters}
          onSelect={(char) => nine.selectCharacter(activePanelIndex, char)}
          onClose={() => setModalOpen(false)}
        />
      </main>
      <SakuraEffect />
      <SiteFooter />
    </div>
  )
}
