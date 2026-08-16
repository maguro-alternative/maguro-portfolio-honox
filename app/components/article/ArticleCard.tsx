import type { Article } from '../../lib/articles'

const PLATFORM_STYLES: Record<
  Article['platform'],
  { label: string; bg: string; icon: string }
> = {
  qiita: { label: 'Qiita', bg: 'bg-[#55C500]/20', icon: '📝' },
  zenn: { label: 'Zenn', bg: 'bg-[#3EA8FF]/20', icon: '📘' },
  note: { label: 'note', bg: 'bg-[#41C9B4]/20', icon: '✏️' },
  blog: { label: 'Blog', bg: 'bg-[#FF6B6B]/20', icon: '🐟' },
  slides: { label: 'Slides', bg: 'bg-[#A78BFA]/20', icon: '🎤' },
}

export default function ArticleCard({ article }: { article: Article }) {
  const style = PLATFORM_STYLES[article.platform]
  const date = new Date(article.publishedAt).toLocaleDateString('ja-JP')
  const isInternal =
    article.platform === 'blog' || article.platform === 'slides'

  const className =
    'block rounded-lg p-4 bg-white/5 hover:bg-white/10 transition-colors'

  const content = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${style.bg} text-white`}
        >
          {style.icon} {style.label}
        </span>
        <span className="text-xs text-white/60">{date}</span>
      </div>
      <h3 className="text-sm leading-snug text-white line-clamp-2">
        {article.title}
      </h3>
    </>
  )

  if (isInternal) {
    return (
      <a href={article.url} className={className}>
        {content}
      </a>
    )
  }

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {content}
    </a>
  )
}
