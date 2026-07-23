import { useState, useMemo, useEffect, useRef } from 'hono/jsx'
import {
  kaguraCharacters,
  type KaguraCharacter,
} from '../lib/nine/kaguraCharacters'
import { generateCanvasImage } from '../lib/nine/canvasDownload'

export interface SelectedItem {
  name: string
  image?: string
  originalImage?: string
  slug?: string
}

function createEmptyItems(): SelectedItem[] {
  return Array(9)
    .fill(null)
    .map(() => ({ name: '' }))
}

function proxyUrl(imageUrl: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
}

const slugToIndex = new Map(kaguraCharacters.map((c, i) => [c.slug, i]))

function buildShareParam(items: SelectedItem[]): string {
  return items
    .map((item) => {
      if (!item.slug) return ''
      const idx = slugToIndex.get(item.slug)
      return idx !== undefined ? String(idx) : ''
    })
    .join('-')
}

function parseShareParam(param: string): SelectedItem[] {
  const items = createEmptyItems()
  const parts = param.split('-')
  for (let i = 0; i < Math.min(parts.length, 9); i++) {
    if (parts[i] === '') continue
    const idx = parseInt(parts[i], 10)
    if (isNaN(idx) || idx < 0 || idx >= kaguraCharacters.length) continue
    const char = kaguraCharacters[idx]
    items[i] = {
      name: char.name,
      image: proxyUrl(char.imageUrl),
      originalImage: char.imageUrl,
      slug: char.slug,
    }
  }
  return items
}

function updateOgImageMeta(items: SelectedItem[]) {
  if (typeof window === 'undefined') return
  const params = buildShareParam(items)
  const fullUrl = `${window.location.origin}/api/og/kagura?c=${params}`
  const set = (property: string, attr: 'property' | 'name') => {
    let el = document.querySelector(`meta[${attr}="${property}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute(attr, property)
      document.head.appendChild(el)
    }
    el.setAttribute('content', fullUrl)
  }
  set('og:image', 'property')
  set('twitter:image', 'name')
}

function useKaguraState() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(
    createEmptyItems()
  )

  const shareText = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const c = buildShareParam(selectedItems)
    const shareUrl = `${window.location.origin}/nine/kagura?c=${c}`
    return `私を構成する9人のシノビ少女\n#My9Kagura #私を構成する9人のシノビ少女\n\n${shareUrl}`
  }, [selectedItems])

  const selectedCount = selectedItems.filter((item) => item.name).length

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const cParam = params.get('c')
    if (cParam) {
      const items = parseShareParam(cParam)
      if (items.some((item) => item.name)) setSelectedItems(items)
      return
    }
    const items = createEmptyItems()
    for (let i = 1; i <= 9; i++) {
      const slug = params.get(`s${i}`)
      if (slug) {
        const char = kaguraCharacters.find((c) => c.slug === slug)
        if (char) {
          items[i - 1] = {
            name: char.name,
            image: proxyUrl(char.imageUrl),
            originalImage: char.imageUrl,
            slug: char.slug,
          }
        }
      }
    }
    if (items.some((item) => item.name)) {
      setSelectedItems(items)
      updateOgImageMeta(items)
    }
  }, [])

  const handleSelect = (
    index: number,
    name: string,
    imageUrl: string,
    slug: string
  ) => {
    const newItems = [...selectedItems]
    newItems[index] = {
      name,
      image: proxyUrl(imageUrl),
      originalImage: imageUrl,
      slug,
    }
    setSelectedItems(newItems)
    updateOgImageMeta(newItems)
  }

  const handleRandomSelect = () => {
    const shuffled = [...kaguraCharacters].sort(() => Math.random() - 0.5)
    const items: SelectedItem[] = shuffled.slice(0, 9).map((char) => ({
      name: char.name,
      image: proxyUrl(char.imageUrl),
      originalImage: char.imageUrl,
      slug: char.slug,
    }))
    setSelectedItems(items)
    updateOgImageMeta(items)
  }

  const handleReset = () => {
    const empty = createEmptyItems()
    setSelectedItems(empty)
    updateOgImageMeta(empty)
  }

  const handleClearPanel = (index: number) => {
    const newItems = [...selectedItems]
    newItems[index] = { name: '' }
    setSelectedItems(newItems)
    updateOgImageMeta(newItems)
  }

  const handleCopyShareText = () => {
    navigator.clipboard.writeText(shareText)
    alert('コピーしました！')
  }

  return {
    selectedItems,
    selectedCount,
    shareText,
    handleSelect,
    handleRandomSelect,
    handleReset,
    handleClearPanel,
    handleCopyShareText,
  }
}

function SelectionGrid({
  selectedItems,
  onPanelClick,
  onClearPanel,
}: {
  selectedItems: SelectedItem[]
  onPanelClick: (index: number) => void
  onClearPanel: (index: number) => void
}) {
  return (
    <div className="-mx-4 mb-6 grid grid-cols-3 gap-2 px-2 sm:mx-0 sm:px-0">
      {selectedItems.map((item, index) => (
        <div key={index} className="relative">
          {item.name ? (
            <button
              onClick={() => onPanelClick(index)}
              aria-label={`${item.name} を変更`}
              className="group relative aspect-square w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 p-0"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1 pb-1.5 pt-5">
                <p className="truncate text-center text-xs font-bold text-white drop-shadow-sm">
                  {item.name}
                </p>
              </div>
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  onClearPanel(index)
                }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="クリア"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onPanelClick(index)}
              aria-label={`スロット ${index + 1} にキャラクターを追加`}
              className="relative aspect-square w-full overflow-hidden rounded-lg transition-opacity hover:opacity-80"
            >
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="480" height="480" rx="40" ry="40" fill="#999" stroke="#333" strokeWidth="8" />
                <rect x="40" y="40" width="420" height="420" rx="5" ry="5" fill="none" stroke="#ccc" strokeWidth="4" opacity="0.5" />
                <circle cx="250" cy="250" r="180" fill="none" stroke="#666" strokeWidth="2" />
                <circle cx="250" cy="250" r="170" fill="none" stroke="#666" strokeWidth="5" />
                <defs>
                  <path id={`textCircle-${index}`} d="M 250, 250 m -145, 0 a 145,145 0 1,1 290,0 a 145,145 0 1,1 -290,0" />
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
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

function ShareTextSection({
  shareText,
  onCopy,
  disabled,
}: {
  shareText: string
  onCopy: () => void
  disabled?: boolean
}) {
  const openShare = (base: string) => {
    window.open(
      `${base}${encodeURIComponent(shareText)}`,
      '_blank',
      'width=550,height=420'
    )
  }

  if (disabled) {
    return (
      <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 opacity-50">
        <p className="text-sm font-semibold text-slate-400">シェアテキスト</p>
        <p className="text-xs text-slate-400">9キャラすべて選択するとシェアできます</p>
      </section>
    )
  }

  return (
    <section className="space-y-3 rounded-lg border border-slate-300 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-700">シェアテキスト</p>
      <div className="rounded-md border border-slate-300 bg-white p-3">
        <p className="mb-2 text-xs text-slate-500">
          文字数: {shareText.replace(/https?:\/\/\S+/g, '').length}
        </p>
        <p className="whitespace-pre-wrap break-all text-xs text-slate-800">{shareText}</p>
        <div className="mt-4 flex gap-2 border-t border-slate-200 pt-3">
          <button
            onClick={onCopy}
            className="rounded border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
          >
            コピー
          </button>
          <button
            onClick={() => openShare('https://twitter.com/intent/tweet?text=')}
            className="flex items-center gap-1 rounded border border-blue-400 bg-blue-400 px-3 py-1 text-xs text-white hover:bg-blue-500"
          >
            Xでシェア
          </button>
          <button
            onClick={() => openShare('https://bsky.app/intent/compose?text=')}
            className="flex items-center gap-1 rounded border border-sky-500 bg-sky-500 px-3 py-1 text-xs text-white hover:bg-sky-600"
          >
            Blueskyでシェア
          </button>
        </div>
      </div>
    </section>
  )
}

function CharacterSearchModal({
  isOpen,
  panelIndex,
  onSelect,
  onClose,
}: {
  isOpen: boolean
  panelIndex: number
  onSelect: (name: string, imageUrl: string, slug: string) => void
  onClose: () => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  const term = searchTerm.toLowerCase()
  const filtered: KaguraCharacter[] = searchTerm
    ? kaguraCharacters.filter(
        (char) =>
          char.name.toLowerCase().includes(term) ||
          char.reading.includes(term) ||
          char.team.toLowerCase().includes(term)
      )
    : []

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl sm:m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">#{panelIndex + 1} キャラを検索</h2>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="キャラ名・チーム名で検索"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
            value={searchTerm}
            onInput={(e) => setSearchTerm((e.currentTarget as HTMLInputElement).value)}
          />
        </div>

        <div className="max-h-72 overflow-y-auto">
          {searchTerm === '' ? (
            <p className="py-8 text-center text-sm text-slate-400">
              キャラ名・チーム名などで検索してください
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">
              該当するキャラクターが見つかりません
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((char, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSearchTerm('')
                    onSelect(char.name, char.imageUrl, char.slug)
                    onClose()
                  }}
                  className="flex w-full items-center gap-3 px-2 py-3 text-left hover:bg-slate-50"
                >
                  <img
                    src={proxyUrl(char.imageUrl)}
                    alt={char.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-800">{char.name}</div>
                    <div className="text-xs text-slate-500">{char.team}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SiteFooter() {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center justify-center gap-1 bg-black py-3 relative z-10 pointer-events-auto select-text">
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
  const {
    selectedItems,
    selectedCount,
    shareText,
    handleSelect,
    handleRandomSelect,
    handleReset,
    handleClearPanel,
    handleCopyShareText,
  } = useKaguraState()

  const [modalOpen, setModalOpen] = useState(false)
  const [activePanelIndex, setActivePanelIndex] = useState(0)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)

  const handlePanelClick = (index: number) => {
    setActivePanelIndex(index)
    setModalOpen(true)
  }

  const handleGenerate = async () => {
    try {
      const dataUrl = await generateCanvasImage(
        '私を構成する9人のシノビ少女',
        selectedItems,
        'square'
      )
      setGeneratedImage(dataUrl)
    } catch (err) {
      console.error('画像の生成に失敗しました', err)
      alert('画像の生成に失敗しました。')
    }
  }

  return (
    <div className="kagura-portal-bg relative min-h-screen w-full overflow-hidden">
      <div className="kagura-header-bg border-b-2 border-slate-400">
        <header className="mx-auto max-w-[700px] px-4 pb-4 pt-6 text-center">
          <h1 className="text-2xl font-bold text-slate-800">私を構成する9人のシノビ少女</h1>
          <p className="mt-1 text-sm text-slate-600">
            9人のシノビ少女を選んで一覧化し、画像として保存できます。
          </p>
        </header>
      </div>

      <main className="kagura-content-box">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">{selectedCount} / 9 キャラ選択済み</p>
          <div className="flex gap-2">
            <button
              onClick={handleRandomSelect}
              className="rounded-md bg-indigo-500 px-3 py-1 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600"
            >
              ランダム
            </button>
            <button
              onClick={handleReset}
              disabled={selectedCount === 0}
              className="rounded-md bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
            >
              リセット
            </button>
          </div>
        </div>

        <SelectionGrid
          selectedItems={selectedItems}
          onPanelClick={handlePanelClick}
          onClearPanel={handleClearPanel}
        />

        <div className="mb-8 text-center">
          <button
            onClick={handleGenerate}
            disabled={selectedCount < 9}
            className="rounded-lg bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            画像を作成
          </button>
        </div>

        {generatedImage && (
          <div className="mb-8">
            <img src={generatedImage} alt="私を構成する9人のシノビ少女" className="w-full rounded-lg shadow-md" />
          </div>
        )}

        <ShareTextSection shareText={shareText} onCopy={handleCopyShareText} disabled={selectedCount < 9} />

        <CharacterSearchModal
          isOpen={modalOpen}
          panelIndex={activePanelIndex}
          onSelect={(name, imageUrl, slug) => handleSelect(activePanelIndex, name, imageUrl, slug)}
          onClose={() => setModalOpen(false)}
        />
      </main>
      <SakuraEffect />
      <SiteFooter />
    </div>
  )
}
