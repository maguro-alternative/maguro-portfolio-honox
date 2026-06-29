import type { Article } from '../../lib/articles'
import ArticleCard from './ArticleCard'

export default function ArticlesSection({
  articles,
}: {
  articles: Article[]
}) {
  if (articles.length === 0) return null

  return (
    <section className="text-white max-w-4/5 mx-auto mb-8">
      <h2 className="text-2xl mb-4">最新の記事</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {articles.map((article) => (
          <ArticleCard key={article.url} article={article} />
        ))}
      </div>
      <div className="mt-4 text-center">
        <a
          href="/articles"
          className="inline-block px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm text-white no-underline"
        >
          もっと見る →
        </a>
      </div>
    </section>
  )
}
