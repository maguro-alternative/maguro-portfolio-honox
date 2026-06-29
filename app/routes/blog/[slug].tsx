import { createRoute } from 'honox/factory'
import WaveLayout from '../../components/layout/WaveLayout'
import Header from '../../components/commonUI/Header'
import Footer from '../../components/layout/Footer'
import Toc from '../../components/features/Toc'
import TocSpy from '../../islands/TocSpy'
import { getBlogPost } from '../../lib/blog'
import { renderBlogContent, estimateReadingMinutes } from '../../lib/markdown'

export default createRoute(async (c) => {
  const slug = c.req.param('slug')
  const post = getBlogPost(slug)

  if (!post) {
    return c.notFound()
  }

  const date = new Date(post.frontmatter.publishedAt).toLocaleDateString(
    'ja-JP',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )
  const minutes = estimateReadingMinutes(post.content)
  const { html, toc } = await renderBlogContent(post.content)
  const ogImage = `/api/og/blog?title=${encodeURIComponent(
    post.frontmatter.title
  )}&date=${encodeURIComponent(post.frontmatter.publishedAt)}`

  return c.render(
    <WaveLayout>
      <Header />
      {/* 本文は読みやすい行長に絞る（max-w-3xl ≒ 全角40〜45文字） */}
      <article className="text-white max-w-3xl mx-auto px-4 mb-16">
        {/* 戻る導線 */}
        <a
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm text-white/75 no-underline hover:text-white transition-colors mb-6"
        >
          ← Articles に戻る
        </a>

        {/* タイトルブロック */}・
        <header className="mb-5">
          <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
            <span className="text-xs font-bold text-white bg-[#FF7A6B]/90 px-2.5 py-0.5 rounded-full">
              🐟 Blog
            </span>
            <span className="text-xs text-white/65">{date}</span>
            <span className="text-xs text-white/45">·</span>
            <span className="text-xs text-white/65">約{minutes}分で読めます</span>
          </div>
          <h1 className="text-[2.35rem] font-bold leading-[1.32] tracking-[0.01em] text-balance mb-4">
            {post.frontmatter.title}
          </h1>
          {/* タグ（frontmatter に tags があれば） */}
          {Array.isArray(post.frontmatter.tags) && (
            <div className="flex flex-wrap gap-2">
              {post.frontmatter.tags.map((t: string) => (
                <span
                  key={t}
                  className="text-xs text-white/70 bg-white/8 border border-white/12 px-2.5 py-0.5 rounded-md"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* 目次 */}
        <Toc items={toc} />

        {/* 本文：不透明ガラスのパネルで背景と読書面を分離 */}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* スクロール連動で目次の現在地をハイライト */}
        <TocSpy />

        {/* 末尾の戻り導線 */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <a
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm text-white/75 no-underline hover:text-white transition-colors"
          >
            ← 記事一覧へ
          </a>
        </div>
      </article>
      <Footer />
    </WaveLayout>,
    {
      title: `${post.frontmatter.title} | マグロポートフォリオ`,
      description: post.frontmatter.description ?? '',
      ogImage,
      ogType: 'article',
    }
  )
})
