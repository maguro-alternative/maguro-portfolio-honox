import { createRoute } from 'honox/factory'
import BlogLayout from '../../components/layout/BlogLayout'
import Toc from '../../components/article/Toc'
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
    <BlogLayout
      hero={
        <>
          <a
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm text-white/75 no-underline hover:text-white transition-colors mb-6"
          >
            ← Articles に戻る
          </a>

          <header className="text-white">
            <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
              <span className="text-xs font-bold text-white bg-[#FF7A6B]/90 px-2.5 py-0.5 rounded-full">
                🐟 Blog
              </span>
              <span className="text-xs text-white/75">{date}</span>
              <span className="text-xs text-white/55">·</span>
              <span className="text-xs text-white/75">約{minutes}分で読めます</span>
            </div>
            <h1 className="text-[2.35rem] font-bold leading-[1.32] tracking-[0.01em] text-balance mb-4">
              {post.frontmatter.title}
            </h1>
            {Array.isArray(post.frontmatter.tags) && (
              <div className="flex flex-wrap gap-2">
                {post.frontmatter.tags.map((t: string) => (
                  <span
                    key={t}
                    className="text-xs text-white/80 bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-md"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </header>
        </>
      }
    >
      <article className="text-white">
        <Toc items={toc} />

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <TocSpy />

        <div className="mt-10 pt-6 border-t border-white/10">
          <a
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm text-white/75 no-underline hover:text-white transition-colors"
          >
            ← 記事一覧へ
          </a>
        </div>
      </article>
    </BlogLayout>,
    {
      title: `${post.frontmatter.title} | マグロポートフォリオ`,
      description: post.frontmatter.description ?? '',
      ogImage,
      ogType: 'article',
    }
  )
})
