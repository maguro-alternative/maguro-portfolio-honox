// MDX の <LinkCard> / <TweetEmbed> を SSR 時に HTML 文字列へ変換する。
// 元は Next.js の React Server Component（OGP / fxtwitter を fetch）だったものを移植。

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

// ===== LinkCard =====
type OgpData = {
  title: string
  description: string
  image: string
  favicon: string
  url: string
}

async function fetchOgpData(url: string): Promise<OgpData> {
  const fallback: OgpData = { title: url, description: '', image: '', favicon: '', url }

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'bot' } })
    if (!res.ok) return fallback

    const html = await res.text()

    const getMetaContent = (property: string): string => {
      const regex = new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`,
        'i'
      )
      const match = html.match(regex)
      return match?.[1] || match?.[2] || ''
    }

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const origin = new URL(url).origin

    return {
      title: getMetaContent('og:title') || titleMatch?.[1] || url,
      description: getMetaContent('og:description') || getMetaContent('description'),
      image: getMetaContent('og:image'),
      favicon: `https://www.google.com/s2/favicons?domain=${origin}&sz=32`,
      url,
    }
  } catch {
    return fallback
  }
}

export async function linkCardHtml(href: string): Promise<string> {
  const ogp = await fetchOgpData(href)
  const hostname = (() => {
    try {
      return new URL(ogp.url).hostname
    } catch {
      return ogp.url
    }
  })()

  const image = ogp.image
    ? `<img src="${escapeAttr(ogp.image)}" alt="" class="link-card-image" />`
    : ''
  const description = ogp.description
    ? `<div class="link-card-description">${escapeHtml(ogp.description)}</div>`
    : ''
  const favicon = ogp.favicon
    ? `<img src="${escapeAttr(ogp.favicon)}" alt="" width="16" height="16" />`
    : ''

  return `<a href="${escapeAttr(ogp.url)}" target="_blank" rel="noopener noreferrer" class="link-card">${image}<div class="link-card-content"><div class="link-card-title">${escapeHtml(ogp.title)}</div>${description}<div class="link-card-url">${favicon}<span>${escapeHtml(hostname)}</span></div></div></a>`
}

// ===== TweetEmbed =====
type TweetMedia = { type: 'photo' | 'video'; url: string; thumbnailUrl?: string }
type TweetData = {
  authorName: string
  authorHandle: string
  authorAvatar: string
  text: string
  createdAt: string
  media?: TweetMedia
}

const TWEET_URL_PATTERN =
  /(?:twitter\.com|x\.com|fxtwitter\.com|fixupx\.com|vxtwitter\.com)\/.+\/status\/(\d+)/

function extractTweetId(idOrUrl: string): string {
  const match = idOrUrl.match(TWEET_URL_PATTERN)
  if (match) return match[1]
  return idOrUrl.replace(/\D/g, '')
}

async function fetchTweet(tweetId: string): Promise<TweetData | undefined> {
  try {
    const res = await fetch(`https://api.fxtwitter.com/i/status/${tweetId}`)
    if (!res.ok) return undefined
    const json = (await res.json()) as { tweet?: any }
    const tweet = json.tweet
    if (!tweet) return undefined

    let media: TweetMedia | undefined
    if (tweet.media?.videos?.[0]) {
      media = {
        type: 'video',
        url: tweet.media.videos[0].url,
        thumbnailUrl: tweet.media.videos[0].thumbnail_url,
      }
    } else if (tweet.media?.photos?.[0]) {
      media = { type: 'photo', url: tweet.media.photos[0].url }
    }

    return {
      authorName: tweet.author?.name ?? '',
      authorHandle: tweet.author?.screen_name ?? '',
      authorAvatar: tweet.author?.avatar_url ?? '',
      text: tweet.text ?? '',
      createdAt: tweet.created_at ?? '',
      media,
    }
  } catch {
    return undefined
  }
}

export async function tweetEmbedHtml(idOrUrl: string): Promise<string> {
  const tweetId = extractTweetId(idOrUrl)
  if (!tweetId) return ''

  const tweetUrl = `https://x.com/i/status/${tweetId}`
  const data = await fetchTweet(tweetId)

  if (!data) {
    return `<div class="tweet-embed"><a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" class="tweet-fallback-card"><div class="tweet-fallback-text">ツイートを読み込めませんでした</div><div class="tweet-fallback-date">${tweetUrl}</div></a></div>`
  }

  let mediaHtml = ''
  if (data.media) {
    if (data.media.type === 'video') {
      mediaHtml = `<video src="${escapeAttr(data.media.url)}"${
        data.media.thumbnailUrl ? ` poster="${escapeAttr(data.media.thumbnailUrl)}"` : ''
      } controls playsinline preload="metadata" class="tweet-fallback-media"></video>`
    } else {
      mediaHtml = `<a href="${tweetUrl}" target="_blank" rel="noopener noreferrer"><img src="${escapeAttr(data.media.url)}" alt="" class="tweet-fallback-media" /></a>`
    }
  }

  return `<div class="tweet-embed"><div class="tweet-fallback-card"><a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" class="tweet-fallback-link"><div class="tweet-fallback-header"><img src="${escapeAttr(data.authorAvatar)}" alt="" class="tweet-fallback-avatar" width="40" height="40" /><div><div class="tweet-fallback-name">${escapeHtml(data.authorName)}</div><div class="tweet-fallback-handle">@${escapeHtml(data.authorHandle)}</div></div></div><div class="tweet-fallback-text">${escapeHtml(data.text)}</div></a>${mediaHtml}<a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" class="tweet-fallback-link"><div class="tweet-fallback-date">${escapeHtml(data.createdAt)}</div></a></div></div>`
}
