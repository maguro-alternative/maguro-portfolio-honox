// プレビュー上のドラッグ移動 / ピンチ・ホイール拡大縮小。選択中レイヤーだけを動かす。
import { useRef, type RefObject } from 'hono/jsx'
import { ZOOM_MAX, ZOOM_MIN, type PhotoLayer } from './useTalkEditor'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

interface Gesture {
  mode: 'drag' | 'pinch'
  layerId: string
  startOffX: number
  startOffY: number
  startZoom: number
  startX: number
  startY: number
  startDist: number
}

export interface CanvasGestureOptions {
  canvasRef: RefObject<HTMLCanvasElement>
  selected: PhotoLayer | null
  updateLayer(id: string, patch: Partial<PhotoLayer>): void
}

/** canvas 要素にそのまま展開できるイベントハンドラ群 */
export interface CanvasGestureHandlers {
  onPointerDown(e: PointerEvent): void
  onPointerMove(e: PointerEvent): void
  onPointerUp(e: PointerEvent): void
  onPointerCancel(e: PointerEvent): void
  onWheel(e: WheelEvent): void
}

export function useCanvasGesture({
  canvasRef,
  selected,
  updateLayer,
}: CanvasGestureOptions): CanvasGestureHandlers {
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const gesture = useRef<Gesture | null>(null)

  const onPointerDown = (e: PointerEvent) => {
    const canvas = canvasRef.current
    const active = pointers.current
    if (!canvas || !active || !selected) return
    canvas.setPointerCapture(e.pointerId)
    active.set(e.pointerId, { x: e.clientX, y: e.clientY })

    const pts = Array.from(active.values())
    const base = {
      layerId: selected.id,
      startOffX: selected.offX,
      startOffY: selected.offY,
      startZoom: selected.zoom,
    }
    if (pts.length === 1) {
      gesture.current = {
        ...base,
        mode: 'drag',
        startX: pts[0].x,
        startY: pts[0].y,
        startDist: 0,
      }
    } else if (pts.length === 2) {
      gesture.current = {
        ...base,
        mode: 'pinch',
        startX: (pts[0].x + pts[1].x) / 2,
        startY: (pts[0].y + pts[1].y) / 2,
        startDist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
      }
    }
  }

  const onPointerMove = (e: PointerEvent) => {
    const canvas = canvasRef.current
    const g = gesture.current
    const active = pointers.current
    if (!canvas || !g || !active || !active.has(e.pointerId)) return
    active.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const rect = canvas.getBoundingClientRect()
    const pts = Array.from(active.values())

    if (g.mode === 'pinch' && pts.length >= 2) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const zoom = clamp(g.startZoom * (dist / (g.startDist || dist)), ZOOM_MIN, ZOOM_MAX)
      updateLayer(g.layerId, { zoom })
      return
    }

    // ずれはキャンバスの表示サイズで正規化する（出力解像度に依存させない）
    const dx = (pts[0].x - g.startX) / rect.width
    const dy = (pts[0].y - g.startY) / rect.height
    updateLayer(g.layerId, { offX: g.startOffX + dx, offY: g.startOffY + dy })
  }

  const onPointerUp = (e: PointerEvent) => {
    const active = pointers.current
    if (!active) return
    active.delete(e.pointerId)
    if (active.size === 0) gesture.current = null
  }

  const onWheel = (e: WheelEvent) => {
    if (!selected) return
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.06 : 1 / 1.06
    updateLayer(selected.id, { zoom: clamp(selected.zoom * factor, ZOOM_MIN, ZOOM_MAX) })
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onWheel,
  }
}
