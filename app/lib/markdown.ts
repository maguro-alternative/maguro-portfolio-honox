// 変更点:
//  1) marked-highlight + highlight.js でコードをシンタックスハイライト
//  2) h2 / h3 に id を付与し、目次(TOC)用の見出しリストを抽出
//  3) renderBlogContent が { html, toc } を返すように
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'
import { linkCardHtml, tweetEmbedHtml } from './embeds'

const TAG_RE = /<(LinkCard|TweetEmbed)\b([^>]*?)\/?>/g

function getAttr(attrs: string, name: string): string | undefined {
  const m = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`).exec(attrs)
  return m?.[1]
}

// highlight.js を組み込んだ marked インスタンス
const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext'
      return hljs.highlight(code, { language }).value
    },
  })
)

export type TocItem = { level: 2 | 3; id: string; text: string }

// 生成済み HTML の h2/h3 に id を振り、目次データを抽出する
function injectHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = []
  let i = 0
  const out = html.replace(
    /<h([23])>([\s\S]*?)<\/h\1>/g,
    (_m, level: string, inner: string) => {
      const id = `heading-${i++}`
      const text = inner.replace(/<[^>]+>/g, '').trim()
      toc.push({ level: Number(level) as 2 | 3, id, text })
      return `<h${level} id="${id}">${inner}</h${level}>`
    }
  )
  return { html: out, toc }
}

// 読了時間の目安（日本語は約 500 文字/分）
export function estimateReadingMinutes(content: string): number {
  const chars = content.replace(/\s/g, '').length
  return Math.max(1, Math.round(chars / 500))
}

// Markdown 本文を HTML 化しつつ、<LinkCard> / <TweetEmbed> を
// SSR 時に解決した埋め込み HTML へ差し替える。
export async function renderBlogContent(
  content: string
): Promise<{ html: string; toc: TocItem[] }> {
  const embeds: Promise<string>[] = []
  const placeholder = (i: number) => `<!--EMBED_${i}-->`

  const replaced = content.replace(TAG_RE, (_full, tag, attrs) => {
    const i = embeds.length
    if (tag === 'LinkCard') {
      embeds.push(linkCardHtml(getAttr(attrs, 'href') ?? ''))
    } else {
      embeds.push(
        tweetEmbedHtml(getAttr(attrs, 'url') ?? getAttr(attrs, 'id') ?? '')
      )
    }
    return `\n\n${placeholder(i)}\n\n`
  })

  let html = await marked.parse(replaced)

  const resolved = await Promise.all(embeds)
  resolved.forEach((embedHtml, i) => {
    const ph = placeholder(i)
    html = html.replace(`<p>${ph}</p>`, embedHtml).replace(ph, embedHtml)
  })

  return injectHeadingIds(html)
}

// 区切り（スライド断片など）用のシンプルな Markdown→HTML
export async function renderMarkdown(content: string): Promise<string> {
  return await marked.parse(content)
}
