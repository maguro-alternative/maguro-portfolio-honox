interface ShareTextSectionProps {
  shareText: string
  onCopy(): void
  disabled?: boolean
}

export default function ShareTextSection({ shareText, onCopy, disabled }: ShareTextSectionProps) {
  const openShare = (base: string) => {
    window.open(`${base}${encodeURIComponent(shareText)}`, '_blank', 'width=550,height=420')
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
        {/* URL は文字数にカウントされない扱いなので、除いた長さを出す */}
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
