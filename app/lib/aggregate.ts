import {
  fetchQiitaArticles,
  fetchZennArticles,
  fetchNoteArticles,
  type Article,
} from './articles'
import { fetchBlogArticles } from './blog'
import { fetchSlideArticles } from './slides'

type Options = {
  qiitaId?: string
  zennId?: string
  noteId?: string
  perSource?: number
}

// blog / slides / Qiita / Zenn / note を集約し、公開日の新しい順に並べる
export async function aggregateArticles({
  qiitaId,
  zennId,
  noteId,
  perSource = 9,
}: Options): Promise<Article[]> {
  const results = await Promise.all([
    Promise.resolve(fetchBlogArticles(perSource)),
    Promise.resolve(fetchSlideArticles(perSource)),
    qiitaId ? fetchQiitaArticles(qiitaId, perSource) : Promise.resolve([]),
    zennId ? fetchZennArticles(zennId, perSource) : Promise.resolve([]),
    noteId ? fetchNoteArticles(noteId, perSource) : Promise.resolve([]),
  ])

  return results
    .flat()
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
}
