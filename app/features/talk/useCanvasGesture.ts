import { useRef, type RefObject } from 'hono/jsx'
import type { PhotoLayer } from './useTalkEditor'
import { beginGesture, gesturePatch, wheelZoom, type GestureState, type Point } from './gesture'

export interface CanvasGestureOptions {
  canvasRef: RefObject<HTMLCanvasElement>
  selected: PhotoLayer | null
  updateLayer(id: string, patch: Partial<PhotoLayer>): void
}

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
  const pointers = useRef<Map<number, Point>>(new Map())
  const gesture = useRef<GestureState | null>(null)

  const onPointerDown = (e: PointerEvent) => {
    const canvas = canvasRef.current
    const active = pointers.current
    if (!canvas || !active || !selected) return
    canvas.setPointerCapture(e.pointerId)
    active.set(e.pointerId, { x: e.clientX, y: e.clientY })
    gesture.current = beginGesture(selected, Array.from(active.values()))
  }

  const onPointerMove = (e: PointerEvent) => {
    const canvas = canvasRef.current
    const g = gesture.current
    const active = pointers.current
    if (!canvas || !g || !active || !active.has(e.pointerId)) return
    active.set(e.pointerId, { x: e.clientX, y: e.clientY })

    const patch = gesturePatch(g, Array.from(active.values()), canvas.getBoundingClientRect())
    if (patch) updateLayer(g.layerId, patch)
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
    updateLayer(selected.id, { zoom: wheelZoom(selected.zoom, e.deltaY) })
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onWheel,
  }
}
