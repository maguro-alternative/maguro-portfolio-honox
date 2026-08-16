// プレビュー上のドラッグ / ピンチ / ホイールの計算。
// DOM を触らないので、フックを通さずそのままテストできる。
import { ZOOM_MAX, ZOOM_MIN, clamp, type LayerPatch } from './layerOps'

export interface Point {
  x: number
  y: number
}

/** ジェスチャ開始時点のレイヤー。id と変形の 3 値だけあればよい */
export interface GestureLayer {
  id: string
  offX: number
  offY: number
  zoom: number
}

export interface GestureState {
  mode: 'drag' | 'pinch'
  layerId: string
  startOffX: number
  startOffY: number
  startZoom: number
  startX: number
  startY: number
  /** pinch のときの 2 点間距離。drag では 0 */
  startDist: number
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** 押されているポインタからジェスチャの起点を作る。3 本以上と 0 本は扱わない */
export function beginGesture(layer: GestureLayer, points: readonly Point[]): GestureState | null {
  const base = {
    layerId: layer.id,
    startOffX: layer.offX,
    startOffY: layer.offY,
    startZoom: layer.zoom,
  }
  if (points.length === 1) {
    return { ...base, mode: 'drag', startX: points[0].x, startY: points[0].y, startDist: 0 }
  }
  if (points.length === 2) {
    return {
      ...base,
      mode: 'pinch',
      startX: (points[0].x + points[1].x) / 2,
      startY: (points[0].y + points[1].y) / 2,
      startDist: distance(points[0], points[1]),
    }
  }
  return null
}

/**
 * 現在のポインタ位置から、レイヤーへ当てる差分を求める。
 * rect はキャンバスの表示サイズ。ずれをこれで正規化して、出力解像度に依存させない。
 */
export function gesturePatch(
  gesture: GestureState,
  points: readonly Point[],
  rect: { width: number; height: number }
): LayerPatch | null {
  if (points.length === 0) return null

  if (gesture.mode === 'pinch' && points.length >= 2) {
    const dist = distance(points[0], points[1])
    // 指を離さずに戻したときに 0 除算しないよう、開始距離が 0 なら等倍扱いにする
    const ratio = dist / (gesture.startDist || dist)
    return { zoom: clamp(gesture.startZoom * ratio, ZOOM_MIN, ZOOM_MAX) }
  }

  if (rect.width === 0 || rect.height === 0) return null
  return {
    offX: gesture.startOffX + (points[0].x - gesture.startX) / rect.width,
    offY: gesture.startOffY + (points[0].y - gesture.startY) / rect.height,
  }
}

/** ホイール 1 ノッチ分の拡大率。deltaY が負（奥へ回す）で拡大 */
const WHEEL_STEP = 1.06

export function wheelZoom(currentZoom: number, deltaY: number): number {
  const factor = deltaY < 0 ? WHEEL_STEP : 1 / WHEEL_STEP
  return clamp(currentZoom * factor, ZOOM_MIN, ZOOM_MAX)
}
