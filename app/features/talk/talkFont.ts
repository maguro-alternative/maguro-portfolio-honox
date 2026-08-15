// Canvas 用の Web フォント読み込み。
//
// あえてフックにしていない。マウント時だけの useEffect は hono/jsx で走らないことがあるため、
// 呼び出し側は「実際に描画する effect」の中からこれを毎回呼び、
// 解決したら自前の fontReady state を立てて再描画させる形にしている。

export interface TalkFontConfig {
  /** <link> の重複挿入を防ぐための id。フォント単位のキャッシュキーも兼ねる */
  linkId: string
  href: string
  family: string
  /**
   * 待ち受けるフォントフェイス。
   * 描画に使うのと同じ weight / size で待たないと、可変フォントの別インスタンスを待ってしまう。
   */
  faces: { weight: number; size: number }[]
}

const SAMPLE = 'あアｱ亜A1！'

const pending = new Map<string, Promise<void>>()

export function ensureTalkFont(config: TalkFontConfig): Promise<void> {
  const cached = pending.get(config.linkId)
  if (cached) return cached

  if (!document.getElementById(config.linkId)) {
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = 'https://fonts.gstatic.com'
    preconnect.crossOrigin = ''
    document.head.appendChild(preconnect)

    const link = document.createElement('link')
    link.id = config.linkId
    link.rel = 'stylesheet'
    link.href = config.href
    document.head.appendChild(link)
  }

  // 読み込みに失敗してもフォールバック書体で描けるので、握りつぶして解決させる
  const promise = Promise.all(
    config.faces.map((f) => document.fonts.load(`${f.weight} ${f.size}px ${config.family}`, SAMPLE))
  ).then(
    () => undefined,
    () => undefined
  )
  pending.set(config.linkId, promise)
  return promise
}
