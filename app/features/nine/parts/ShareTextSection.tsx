import { useState } from 'hono/jsx'
import { copyText } from '../../../lib/clipboard'

interface ShareTextSectionProps {
  shareText: string
  disabled?: boolean
}

export default function ShareTextSection({ shareText, disabled }: ShareTextSectionProps) {
  // コピーの成否はこのボタン自身で伝える。alert はスレッドを止めるうえ、
  // 失敗しても出てしまう（以前は writeText を await していなかった）
  const [copied, setCopied] = useState<'idle' | 'ok' | 'failed'>('idle')

  const openShare = (base: string) => {
    window.open(`${base}${encodeURIComponent(shareText)}`, '_blank', 'width=550,height=420')
  }

  const handleCopy = async () => {
    const ok = await copyText(shareText)
    setCopied(ok ? 'ok' : 'failed')
    setTimeout(() => setCopied('idle'), 2000)
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
            onClick={() => void handleCopy()}
            aria-live="polite"
            className="rounded border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
          >
            {copied === 'ok' ? 'コピーしました' : copied === 'failed' ? 'コピーできません' : 'コピー'}
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
