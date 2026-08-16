import { describe, expect, it } from 'vitest'
import { pickRandom } from './pickRandom'

const list = Array.from({ length: 10 }, (_, i) => i)

describe('pickRandom', () => {
  it('指定した件数を返す', () => {
    expect(pickRandom(list, 3)).toHaveLength(3)
  })

  it('重複しない', () => {
    const picked = pickRandom(list, 10)
    expect(new Set(picked).size).toBe(10)
  })

  it('全件が元の集合に含まれる', () => {
    expect(pickRandom(list, 5).every((v) => list.includes(v))).toBe(true)
  })

  it('件数が母数を超えても母数までしか返さない', () => {
    expect(pickRandom(list, 999)).toHaveLength(10)
  })

  it('0 件・空配列でも壊れない', () => {
    expect(pickRandom(list, 0)).toEqual([])
    expect(pickRandom([], 5)).toEqual([])
  })

  it('元の配列を書き換えない', () => {
    const before = [...list]
    pickRandom(list, 5)
    expect(list).toEqual(before)
  })

  it('random を差し替えれば結果が決まる', () => {
    // 常に 0 を返す＝毎回「残りの先頭」を選ぶので、元の順序がそのまま出る
    expect(pickRandom(list, 3, () => 0)).toEqual([0, 1, 2])
  })

  // sort(() => Math.random() - 0.5) だった頃は、
  // 先頭が期待の 2.2 倍・後方が 0.65 倍しか出ず、ここが通らなかった
  it('どの要素も等しい確率で選ばれる', () => {
    const N = 20
    const PICK = 5
    const TRIALS = 20000
    const pool = Array.from({ length: N }, (_, i) => i)
    const counts = new Array(N).fill(0)

    for (let t = 0; t < TRIALS; t++) {
      for (const v of pickRandom(pool, PICK)) counts[v]++
    }

    const expected = (TRIALS * PICK) / N
    const ratios = counts.map((c) => c / expected)
    expect(Math.min(...ratios)).toBeGreaterThan(0.9)
    expect(Math.max(...ratios)).toBeLessThan(1.1)
  })
})
