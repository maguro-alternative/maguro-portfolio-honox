import { createRoute } from 'honox/factory'
import { getSlideDeck } from '../../lib/slides'
import { renderMarkdown } from '../../lib/markdown'
import SlideViewer from '../../islands/SlideViewer'

export default createRoute(async (c) => {
  const slug = c.req.param('slug')
  const deck = getSlideDeck(slug)

  if (!deck) {
    return c.notFound()
  }

  const slidesHtml = await Promise.all(
    deck.slides.map((md) => renderMarkdown(md))
  )

  const ogImage = `/api/og/slides?title=${encodeURIComponent(
    deck.frontmatter.title
  )}&date=${encodeURIComponent(deck.frontmatter.date)}`

  return c.render(
    <SlideViewer title={deck.frontmatter.title} slidesHtml={slidesHtml} />,
    {
      title: `${deck.frontmatter.title} | スライド`,
      description: deck.frontmatter.description ?? '',
      ogImage,
      ogType: 'article',
    }
  )
})
