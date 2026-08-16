export const ZOOM_MIN = 0.15
export const ZOOM_MAX = 5

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** ジェスチャやスライダーがレイヤーへ当てる差分 */
export interface LayerPatch {
  offX?: number
  offY?: number
  zoom?: number
}

/**
 * id のレイヤーを dir 方向へ 1 つ動かした配列を返す。
 * 端で動かせないときは受け取った配列をそのまま返す（再描画を起こさないため）。
 * dir: 1 で前面（配列の後ろ）、-1 で背面。
 */
export function moveLayer<T extends { id: string }>(
  layers: readonly T[],
  id: string,
  dir: -1 | 1
): readonly T[] {
  const i = layers.findIndex((l) => l.id === id)
  const j = i + dir
  if (i < 0 || j < 0 || j >= layers.length) return layers
  const next = [...layers]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}
