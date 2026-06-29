import type { Article } from './articles'
import { parseFrontmatter, slugFromPath } from './content'

const files = import.meta.glob('../content/slides/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export type SlideFrontmatter = {
  title: string
  date: string
  description?: string
}

export type SlideDeck = {
  slug: string
  frontmatter: SlideFrontmatter
  slides: string[]
}

const decks: SlideDeck[] = Object.entries(files).map(([path, raw]) => {
  const { data, content } = parseFrontmatter(raw)
  const slides = content
    .split(/^---$/m)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  return {
    slug: slugFromPath(path),
    frontmatter: data as SlideFrontmatter,
    slides,
  }
})

export function getSlideSlugs(): string[] {
  return decks.map((d) => d.slug)
}

export function getSlideDeck(slug: string): SlideDeck | null {
  return decks.find((d) => d.slug === slug) ?? null
}

export function getAllSlideDecks(): SlideDeck[] {
  return [...decks].sort(
    (a, b) =>
      new Date(b.frontmatter.date).getTime() -
      new Date(a.frontmatter.date).getTime()
  )
}

export function fetchSlideArticles(count = 3): Article[] {
  return getAllSlideDecks()
    .slice(0, count)
    .map((deck) => ({
      title: deck.frontmatter.title,
      url: `/slides/${deck.slug}`,
      publishedAt: deck.frontmatter.date,
      platform: 'slides' as const,
    }))
}
