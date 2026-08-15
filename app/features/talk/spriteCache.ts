// エンブレム / ロゴなどの UI 素材画像。ページをまたいで使い回すのでモジュールスコープに置く。
// 読み込み完了で再描画させるため、呼び出し側から再描画用のコールバックを受け取る。

const cache = new Map<string, HTMLImageElement>()

/**
 * 読み込み済みなら画像を、未読み込みなら null を返して裏で読み込む。
 * 読み込みが終わると onLoad が呼ばれるので、そこで再描画させること。
 */
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
