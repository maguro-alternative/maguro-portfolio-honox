// OG 画像の SVG を PNG に変換する。
// SNS のカードは SVG を受け付けないため、配信するのは PNG だけにする。
import { initWasm, Resvg } from '@resvg/resvg-wasm'
import wasm from 'virtual:resvg-wasm'
import { logFailure } from './logFailure'

const FONT_FAMILY = 'Noto Sans JP'
const FONT_CSS_URL = 'https://fonts.googleapis.com/css2'
// woff2 を返されると resvg が読めないので、woff2 を知らないブラウザとして ttf を要求する
const LEGACY_UA = 'Mozilla/5.0 (Windows NT 6.1)'

let wasmReady: Promise<void> | null = null

function ensureWasm(): Promise<void> {
  wasmReady ??= initWasm(wasm)
  return wasmReady
}

/** SVG の <text>/<tspan> に出てくる文字。フォントのサブセット要求に使う */
export function collectSvgText(svg: string): string {
  const chars = new Set<string>()
  // 次の要素の < を消費すると入れ子の tspan を拾い損ねるので、終端は先読みで見る
  for (const [, inner] of svg.matchAll(/<(?:text|tspan)\b[^>]*>([^<]*)(?=<)/g)) {
    for (const ch of unescapeXml(inner)) chars.add(ch)
  }
  return [...chars].join('')
}

function unescapeXml(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  // 一度に渡すと引数の数が上限を超えるので分割する
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

const fontCache = new Map<string, Promise<Uint8Array[]>>()

async function loadFonts(text: string): Promise<Uint8Array[]> {
  const url = `${FONT_CSS_URL}?family=${encodeURIComponent(
    FONT_FAMILY
  )}:wght@400;700&text=${encodeURIComponent(text)}`
  const css = await fetch(url, { headers: { 'User-Agent': LEGACY_UA } }).then((r) =>
    r.text()
  )
  const urls = [...css.matchAll(/src:\s*url\(([^)]+)\)/g)].map(([, u]) => u)
  return Promise.all(
    urls.map(async (u) => {
      const buffer: ArrayBuffer = await fetch(u).then((r) => r.arrayBuffer())
      return new Uint8Array(buffer)
    })
  )
}

function fonts(text: string): Promise<Uint8Array[]> {
  const key = [...new Set(text)].sort().join('')
  const cached = fontCache.get(key)
  if (cached) return cached
  const loading = loadFonts(key).catch((error) => {
    // 次のリクエストで引き直せるように、失敗はキャッシュに残さない
    fontCache.delete(key)
    logFailure('og/font', error, { chars: key.length })
    return [] as Uint8Array[]
  })
  fontCache.set(key, loading)
  return loading
}

/**
 * 外部参照の <image href="https://..."> を data URI に置き換える。
 * resvg は外部リソースを取りに行かないので、ここで埋め込まないと空になる。
 */
async function inlineImages(svg: string): Promise<string> {
  const urls = [...new Set([...svg.matchAll(/href="(https?:[^"]+)"/g)].map(([, u]) => u))]
  const entries = await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const type = res.headers.get('Content-Type') ?? 'image/png'
        const buffer: ArrayBuffer = await res.arrayBuffer()
        const body = new Uint8Array(buffer)
        return [url, `data:${type};base64,${toBase64(body)}`] as const
      } catch (error) {
        logFailure('og/inline-image', error, { url })
        return [url, ''] as const
      }
    })
  )
  const byUrl = new Map(entries)
  return svg.replace(
    /href="(https?:[^"]+)"/g,
    (match, url: string) => {
      const dataUri = byUrl.get(url)
      return dataUri ? `href="${dataUri}"` : match
    }
  )
}

async function svgToPng(svg: string): Promise<Uint8Array> {
  const [, inlined, fontBuffers] = await Promise.all([
    ensureWasm(),
    inlineImages(svg),
    fonts(collectSvgText(svg)),
  ])
  const resvg = new Resvg(inlined, {
    font: {
      fontBuffers,
      defaultFontFamily: FONT_FAMILY,
      sansSerifFamily: FONT_FAMILY,
    },
  })
  return resvg.render().asPng()
}

/**
 * OG 画像のレスポンス。SNS のカードは SVG を受け付けないので PNG で返す。
 * 変換に失敗したときだけ、何も出ないよりはましなので SVG をそのまま返す。
 */
export async function ogImageResponse(svg: string): Promise<Response> {
  const headers = { 'Cache-Control': 'public, max-age=86400' }
  try {
    const png = await svgToPng(svg)
    return new Response(png, {
      headers: { ...headers, 'Content-Type': 'image/png' },
    })
  } catch (error) {
    logFailure('og/png', error)
    return new Response(svg, {
      headers: { ...headers, 'Content-Type': 'image/svg+xml' },
    })
  }
}
