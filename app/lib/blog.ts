
import type { Article } from './articles'
import { parseFrontmatter, slugFromPath } from './content'

// ビルド時にコンテンツをバンドルへ取り込む（fs に依存しない）
const files = import.meta.glob('../content/posts/*.{md,mdx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export type BlogFrontmatter = {
  title: string
  publishedAt: string
  description?: string
  tags?: string[]
}

export type BlogPost = {
  slug: string
  frontmatter: BlogFrontmatter
  content: string
}

const posts: BlogPost[] = Object.entries(files).map(([path, raw]) => {
  const { data, content } = parseFrontmatter(raw)
  return {
    slug: slugFromPath(path),
    frontmatter: data as unknown as BlogFrontmatter,
    content,
  }
})

export function getBlogSlugs(): string[] {
  return posts.map((p) => p.slug)
}

export function getBlogPost(slug: string): BlogPost | null {
  return posts.find((p) => p.slug === slug) ?? null
}

export function getAllBlogPosts(): BlogPost[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime()
  )
}

export function fetchBlogArticles(count = 3): Article[] {
  return getAllBlogPosts()
    .slice(0, count)
    .map((post) => ({
      title: post.frontmatter.title,
      url: `/blog/${post.slug}`,
      publishedAt: post.frontmatter.publishedAt,
      platform: 'blog' as const,
    }))
}
