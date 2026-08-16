// island の再マウントをまたいで使い回したいので、フックではなくモジュールスコープに置く。
const cache = new Map<string, HTMLImageElement>()

/** 未読み込みのあいだは null を返すので、onLoad で再描画させること。 */
export function getSprite(src: string | null, onLoad: () => void): HTMLImageElement | null {
  if (!src) return null
  const cached = cache.get(src)
  if (cached) return cached.complete && cached.naturalWidth > 0 ? cached : null
  const img = new Image()
  img.onload = onLoad
  img.src = src
  cache.set(src, img)
  return null
}
