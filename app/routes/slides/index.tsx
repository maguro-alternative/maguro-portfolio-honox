import { createRoute } from 'honox/factory'
import { getAllSlideDecks } from '../../lib/slides'

export default createRoute((c) => {
  const decks = getAllSlideDecks()

  return c.render(
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="px-6 py-6 border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">スライド</h1>
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← トップへ戻る
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {decks.length === 0 ? (
          <p className="text-gray-500 text-center py-20">
            スライドはまだありません。
          </p>
        ) : (
          <ul className="space-y-4">
            {decks.map((deck) => (
              <li key={deck.slug}>
                <a
                  href={`/slides/${deck.slug}`}
                  className="block p-6 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors"
                >
                  <h2 className="text-xl font-semibold mb-1">
                    {deck.frontmatter.title}
                  </h2>
                  {deck.frontmatter.description && (
                    <p className="text-gray-400 text-sm mb-2">
                      {deck.frontmatter.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      {new Date(deck.frontmatter.date).toLocaleDateString(
                        'ja-JP'
                      )}
                    </span>
                    <span>{deck.slides.length} スライド</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>,
    {
      title: 'スライド一覧 | マグロポートフォリオ',
      description: 'マークダウンで書いたスライドの一覧です。',
    }
  )
})
