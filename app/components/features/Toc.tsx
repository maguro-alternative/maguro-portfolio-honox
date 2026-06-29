// app/components/features/Toc.tsx
// 記事の目次。サーバーで生成した見出しリストを受け取って描画する。
import type { TocItem } from '../../lib/markdown'

export default function Toc({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null // 見出しが少なければ非表示

  return (
    <nav
      aria-label="目次"
      className="toc bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-6"
    >
      <div className="text-[11px] font-bold tracking-[0.12em] text-white/50 mb-3">
        目次
      </div>
      <ul className="list-none p-0 m-0">
        {items.map((item) => (
          <li key={item.id} data-level={item.level}>
            <a
              href={`#${item.id}`}
              className="toc-link flex items-center gap-2.5 text-sm text-white/80 no-underline py-1.5 hover:text-[#FFB3A8] transition-colors"
            >
              <span className="toc-dot" />
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
