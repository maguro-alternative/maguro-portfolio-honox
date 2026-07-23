import { useState, useMemo, useEffect, useRef } from 'hono/jsx'
import {
  dolphinCharacters,
  type DolphinCharacter,
} from '../lib/nine/dolphinCharacters'
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

function buildShareParams(items: SelectedItem[]): URLSearchParams {
  const params = new URLSearchParams()
  items.forEach((item, index) => {
    if (item.slug) params.set(`s${index + 1}`, item.slug)
  })
  return params
}

function updateOgImageMeta(items: SelectedItem[]) {
  if (typeof window === 'undefined') return
  const params = buildShareParams(items)
  const fullUrl = `${window.location.origin}/api/og/dolphin?${params.toString()}`
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

function useDolphinState() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(
    createEmptyItems()
  )

  const shareText = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const params = buildShareParams(selectedItems)
    const shareUrl = `${window.location.origin}/nine/dolphin?${params.toString()}`
    return `私を構成する9人のドルフィン\n#My9Dolphin #私を構成する9人のドルフィン\n\n${shareUrl}`
  }, [selectedItems])

  const selectedCount = selectedItems.filter((item) => item.name).length

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const items = createEmptyItems()
    for (let i = 1; i <= 9; i++) {
      const slug = params.get(`s${i}`)
      if (slug) {
        const char = dolphinCharacters.find((c) => c.slug === slug)
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
    const shuffled = [...dolphinCharacters].sort(() => Math.random() - 0.5)
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
              className="group relative aspect-square w-full rounded-md border border-slate-300 bg-slate-100 shadow-sm transition-colors hover:border-slate-400 hover:bg-slate-200/70"
            >
              <div className="absolute inset-2 flex flex-col items-center justify-center gap-1 rounded border border-dashed border-slate-300 group-hover:border-slate-400">
                <svg className="h-10 w-10 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 2h2v9h9v2h-9v9h-2v-9H2v-2h9z" />
                </svg>
                <span className="text-xs font-bold tracking-widest text-slate-500">ENTRY</span>
              </div>
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
        <p className="mb-3 whitespace-pre-wrap break-all text-xs text-slate-800">{shareText}</p>
        <div className="flex gap-2">
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
  const filtered: DolphinCharacter[] = searchTerm
    ? dolphinCharacters.filter(
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

function WaveFooter() {
  return (
    <div className="w-full">
      <div className="relative -mb-1 h-24 overflow-hidden -z-10 pointer-events-none">
        <svg className="pointer-events-none absolute bottom-0 h-full w-[200%] animate-wave-slow" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,100 C90,70 270,70 360,100 C450,130 630,130 720,100 C810,70 990,70 1080,100 C1170,130 1350,130 1440,100 L1440,120 L0,120 Z" fill="rgba(59,130,246,0.5)" />
        </svg>
        <svg className="pointer-events-none absolute bottom-0 h-full w-[200%] animate-wave-mid" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,90 C90,60 270,60 360,90 C450,120 630,120 720,90 C810,60 990,60 1080,90 C1170,120 1350,120 1440,90 L1440,120 L0,120 Z" fill="rgba(96,165,250,0.3)" />
        </svg>
        <svg className="pointer-events-none absolute bottom-0 h-full w-[200%] animate-wave-fast" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,80 C90,50 270,50 360,80 C450,110 630,110 720,80 C810,50 990,50 1080,80 C1170,110 1350,110 1440,80 L1440,120 L0,120 Z" fill="white" />
        </svg>
      </div>
      <div className="flex flex-col items-center justify-center gap-1 bg-blue-500 py-3 relative z-10 pointer-events-auto select-text">
        <p className="pointer-events-auto text-center text-sm text-white">
          &copy; 2025 Maguro Alternative. All rights reserved.
        </p>
        <p className="pointer-events-auto text-center text-sm text-white">
          作者のTwitter:{' '}
          <a href="https://twitter.com/sigumataityouda" className="text-blue-300 hover:text-blue-100" target="_blank" rel="noopener noreferrer">
            @sigumataityouda
          </a>
          ,{' '}
          <a href="https://twitter.com/maguro_alterich" className="text-blue-300 hover:text-blue-100" target="_blank" rel="noopener noreferrer">
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

export default function DolphinClient() {
  const {
    selectedItems,
    selectedCount,
    shareText,
    handleSelect,
    handleRandomSelect,
    handleReset,
    handleClearPanel,
    handleCopyShareText,
  } = useDolphinState()

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
        '私を構成する9人のドルフィン',
        selectedItems,
        'video'
      )
      setGeneratedImage(dataUrl)
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
          <h1 className="mt-1 text-2xl font-bold text-white">私を構成する9人のドルフィン</h1>
          <p className="mt-1 text-sm text-white/90">
            9キャラクターを選んで一覧化し、画像として保存できます。
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-6">
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
            <img src={generatedImage} alt="私を構成する9人のドルフィン" className="w-full rounded-lg shadow-md" />
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
      <WaveFooter />
    </div>
  )
}
