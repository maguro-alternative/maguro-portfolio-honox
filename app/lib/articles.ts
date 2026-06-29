export type Article = {
  title: string
  url: string
  publishedAt: string
  platform: 'qiita' | 'zenn' | 'note' | 'blog' | 'slides'
}

export async function fetchQiitaArticles(
  userId: string,
  count = 3
): Promise<Article[]> {
  try {
    const res = await fetch(
      `https://qiita.com/api/v2/users/${userId}/items?per_page=${count}`
    )
    if (!res.ok) return []
    const items = (await res.json()) as {
      title: string
      url: string
      created_at: string
    }[]
    return items.map(
      (item: { title: string; url: string; created_at: string }) => ({
        title: item.title,
        url: item.url,
        publishedAt: item.created_at,
        platform: 'qiita' as const,
      })
    )
  } catch {
    return []
  }
}

export async function fetchZennArticles(
  userId: string,
  count = 3
): Promise<Article[]> {
  try {
    const res = await fetch(
      `https://zenn.dev/api/articles?username=${userId}&order=latest&count=${count}`
    )
    if (!res.ok) return []
    const data = (await res.json()) as {
      articles?: { title: string; slug: string; published_at: string }[]
    }
    return (data.articles ?? [])
      .slice(0, count)
      .map((item: { title: string; slug: string; published_at: string }) => ({
        title: item.title,
        url: `https://zenn.dev/${userId}/articles/${item.slug}`,
        publishedAt: item.published_at,
        platform: 'zenn' as const,
      }))
  } catch {
    return []
  }
}

export async function fetchNoteArticles(
  userId: string,
  count = 3
): Promise<Article[]> {
  try {
    const res = await fetch(
      `https://note.com/api/v2/creators/${userId}/contents?kind=note&page=1&per_page=${count}`
    )
    if (!res.ok) return []
    const data = (await res.json()) as {
      data?: { contents?: { name: string; noteUrl: string; publishAt: string }[] }
    }
    return (data.data?.contents ?? [])
      .slice(0, count)
      .map((item: { name: string; noteUrl: string; publishAt: string }) => ({
        title: item.name,
        url: item.noteUrl,
        publishedAt: item.publishAt,
        platform: 'note' as const,
      }))
  } catch {
    return []
  }
}
