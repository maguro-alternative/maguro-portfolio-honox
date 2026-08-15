import { useState, useEffect, useRef } from 'hono/jsx'
import { proxyUrl, type NineCharacter } from '../types'

interface CharacterSearchModalProps {
  isOpen: boolean
  panelIndex: number
  characters: NineCharacter[]
  onSelect(char: NineCharacter): void
  onClose(): void
}

export default function CharacterSearchModal({
  isOpen,
  panelIndex,
  characters,
  onSelect,
  onClose,
}: CharacterSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      // 開いた直後はまだ描画が終わっていないことがあるので、1 tick 遅らせてから focus する
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  const term = searchTerm.toLowerCase()
  // 全件表示は数が多すぎて選びにくいので、検索するまでは何も出さない
  const filtered: NineCharacter[] = searchTerm
    ? characters.filter(
        (char) =>
          char.name.toLowerCase().includes(term) ||
          char.reading.includes(term) ||
          char.team.toLowerCase().includes(term)
      )
    : []

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-xl sm:m-4 sm:rounded-2xl"
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
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
              {filtered.map((char) => (
                <button
                  key={char.slug}
                  onClick={() => {
                    setSearchTerm('')
                    onSelect(char)
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
