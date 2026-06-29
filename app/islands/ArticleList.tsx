import { useState } from 'hono/jsx'
import type { Article } from '../lib/articles'
import ArticleCard from '../components/features/ArticleCard'

const FILTERS: { label: string; value: Article['platform'] | 'all' }[] = [
  { label: 'すべて', value: 'all' },
  { label: '🐟 Blog', value: 'blog' },
  { label: '📝 Qiita', value: 'qiita' },
  { label: '📘 Zenn', value: 'zenn' },
  { label: '✏️ note', value: 'note' },
  { label: '🎤 Slides', value: 'slides' },
]

const PER_PAGE = 9

export default function ArticleList({ articles }: { articles: Article[] }) {
  const [filter, setFilter] = useState<Article['platform'] | 'all'>('all')
  const [page, setPage] = useState(1)

  const filtered =
    filter === 'all' ? articles : articles.filter((a) => a.platform === filter)

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE
  )

  const handleFilterChange = (value: Article['platform'] | 'all') => {
    setFilter(value)
    setPage(1)
  }

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors border-none cursor-pointer ${
              filter === f.value
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="text-white/60 text-center py-8">
          記事が見つかりませんでした。
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginated.map((article) => (
              <ArticleCard key={article.url} article={article} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm border-none cursor-pointer transition-colors bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← 前へ
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-3 py-1.5 rounded-lg text-sm border-none cursor-pointer transition-colors ${
                    n === currentPage
                      ? 'bg-white/25 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm border-none cursor-pointer transition-colors bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                次へ →
              </button>
            </div>
          )}
        </>
      )}
    </>
  )
}
