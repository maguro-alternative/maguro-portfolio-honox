import { describe, expect, it } from 'vitest'
import { moveLayer } from './layerOps'

const layers = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
const ids = (list: readonly { id: string }[]) => list.map((l) => l.id)

describe('moveLayer', () => {
  it('前面（配列の後ろ）へ 1 つ動かす', () => {
    expect(ids(moveLayer(layers, 'a', 1))).toEqual(['b', 'a', 'c'])
  })

  it('背面（配列の前）へ 1 つ動かす', () => {
    expect(ids(moveLayer(layers, 'c', -1))).toEqual(['a', 'c', 'b'])
  })

  it('先頭を背面へは動かせない', () => {
    expect(moveLayer(layers, 'a', -1)).toBe(layers)
  })

  it('末尾を前面へは動かせない', () => {
    expect(moveLayer(layers, 'c', 1)).toBe(layers)
  })

  it('知らない id なら何もしない', () => {
    expect(moveLayer(layers, 'zzz', 1)).toBe(layers)
  })

  it('空配列でも壊れない', () => {
    expect(moveLayer([], 'a', 1)).toEqual([])
  })

  it('1 件だけならどちらにも動かせない', () => {
    const one = [{ id: 'a' }]
    expect(moveLayer(one, 'a', 1)).toBe(one)
    expect(moveLayer(one, 'a', -1)).toBe(one)
  })

  it('元の配列を書き換えない', () => {
    const before = ids(layers)
    moveLayer(layers, 'a', 1)
    expect(ids(layers)).toEqual(before)
  })

  it('往復すると元に戻る', () => {
    expect(ids(moveLayer(moveLayer(layers, 'a', 1), 'a', -1))).toEqual(['a', 'b', 'c'])
  })
})
