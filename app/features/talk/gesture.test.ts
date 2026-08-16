import { describe, expect, it } from 'vitest'
import { beginGesture, gesturePatch, wheelZoom } from './gesture'
import { ZOOM_MAX, ZOOM_MIN } from './layerOps'

const layer = { id: 'l1', offX: 0, offY: 0, zoom: 1 }
const rect = { width: 800, height: 450 }

describe('beginGesture', () => {
  it('1 本ならドラッグ', () => {
    const g = beginGesture(layer, [{ x: 10, y: 20 }])
    expect(g).toMatchObject({ mode: 'drag', startX: 10, startY: 20, startDist: 0 })
  })

  it('2 本ならピンチ。起点は中点、距離を覚える', () => {
    const g = beginGesture(layer, [
      { x: 0, y: 0 },
      { x: 60, y: 80 },
    ])
    expect(g).toMatchObject({ mode: 'pinch', startX: 30, startY: 40, startDist: 100 })
  })

  it('開始時のレイヤー状態を控える', () => {
    const g = beginGesture({ id: 'x', offX: 0.2, offY: -0.1, zoom: 2 }, [{ x: 0, y: 0 }])
    expect(g).toMatchObject({ layerId: 'x', startOffX: 0.2, startOffY: -0.1, startZoom: 2 })
  })

  it('0 本と 3 本は扱わない', () => {
    expect(beginGesture(layer, [])).toBeNull()
    expect(beginGesture(layer, [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }])).toBeNull()
  })
})

describe('gesturePatch（ドラッグ）', () => {
  const g = beginGesture(layer, [{ x: 100, y: 100 }])!

  it('ずれを表示サイズで正規化する', () => {
    const patch = gesturePatch(g, [{ x: 500, y: 325 }], rect)
    expect(patch).toEqual({ offX: 400 / 800, offY: 225 / 450 })
  })

  it('開始位置のオフセットに足し込む', () => {
    const from = beginGesture({ ...layer, offX: 0.25 }, [{ x: 0, y: 0 }])!
    expect(gesturePatch(from, [{ x: 80, y: 0 }], rect)?.offX).toBeCloseTo(0.25 + 0.1)
  })

  it('表示サイズが 0 なら何もしない（0 除算を避ける）', () => {
    expect(gesturePatch(g, [{ x: 1, y: 1 }], { width: 0, height: 0 })).toBeNull()
  })

  it('ポインタが無ければ何もしない', () => {
    expect(gesturePatch(g, [], rect)).toBeNull()
  })
})

describe('gesturePatch（ピンチ）', () => {
  const pinch = beginGesture(layer, [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ])!

  it('距離の比がそのまま倍率になる', () => {
    const patch = gesturePatch(pinch, [{ x: 0, y: 0 }, { x: 200, y: 0 }], rect)
    expect(patch).toEqual({ zoom: 2 })
  })

  it('縮めれば倍率も下がる', () => {
    expect(gesturePatch(pinch, [{ x: 0, y: 0 }, { x: 50, y: 0 }], rect)?.zoom).toBeCloseTo(0.5)
  })

  it('上限・下限で頭打ちになる', () => {
    const wide = gesturePatch(pinch, [{ x: 0, y: 0 }, { x: 100000, y: 0 }], rect)
    expect(wide?.zoom).toBe(ZOOM_MAX)
    const narrow = gesturePatch(pinch, [{ x: 0, y: 0 }, { x: 0.001, y: 0 }], rect)
    expect(narrow?.zoom).toBe(ZOOM_MIN)
  })

  it('開始距離が 0 でも 0 除算しない', () => {
    const degenerate = beginGesture(layer, [{ x: 5, y: 5 }, { x: 5, y: 5 }])!
    expect(degenerate.startDist).toBe(0)
    expect(gesturePatch(degenerate, [{ x: 0, y: 0 }, { x: 10, y: 0 }], rect)?.zoom).toBe(1)
  })

  it('指が 1 本に減ったらドラッグとして扱う', () => {
    expect(gesturePatch(pinch, [{ x: 10, y: 0 }], rect)).toHaveProperty('offX')
  })
})

describe('wheelZoom', () => {
  it('奥へ回すと拡大、手前で縮小', () => {
    expect(wheelZoom(1, -100)).toBeGreaterThan(1)
    expect(wheelZoom(1, 100)).toBeLessThan(1)
  })

  it('1 往復すると元の倍率へ戻る', () => {
    expect(wheelZoom(wheelZoom(2, -1), 1)).toBeCloseTo(2)
  })

  it('上限・下限で頭打ちになる', () => {
    expect(wheelZoom(ZOOM_MAX, -1)).toBe(ZOOM_MAX)
    expect(wheelZoom(ZOOM_MIN, 1)).toBe(ZOOM_MIN)
  })
})
