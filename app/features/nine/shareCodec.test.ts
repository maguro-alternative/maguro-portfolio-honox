import { describe, expect, it } from 'vitest'
import { defineCharacters } from '../../lib/nine/types'
import { compactIndexCodec, slugParamsCodec } from './shareCodec'
import { createEmptyItems, toSelectedItem, type SelectedItem } from './types'

const characters = defineCharacters([
  { name: 'あ', reading: 'あ', team: 'A', slug: 'a', imageUrl: 'https://example.com/a.png' },
  { name: 'い', reading: 'い', team: 'A', slug: 'b', imageUrl: 'https://example.com/b.png' },
  { name: 'う', reading: 'う', team: 'B', slug: 'c', imageUrl: 'https://example.com/c.png' },
])

/** slot 番号（1 始まり）→ キャラ index、で埋めた 9 枠を作る */
function itemsAt(placements: Record<number, number>): SelectedItem[] {
  const items = createEmptyItems()
  for (const [slot, charIndex] of Object.entries(placements)) {
    items[Number(slot) - 1] = toSelectedItem(characters[charIndex])
  }
  return items
}

/** 比較しやすいよう、各枠を slug（空欄は null）に落とす */
function slugs(items: SelectedItem[]) {
  return items.map((i) => i.slug ?? null)
}

describe('slugParamsCodec', () => {
  it('埋まっている枠だけを 1 始まりの s パラメータにする', () => {
    const params = slugParamsCodec.encode(itemsAt({ 1: 0, 5: 2 }), characters)
    expect(params.toString()).toBe('s1=a&s5=c')
  })

  it('復元すると元の配置に戻る', () => {
    const items = itemsAt({ 1: 0, 2: 1, 9: 2 })
    const restored = slugParamsCodec.decode(slugParamsCodec.encode(items, characters), characters)
    expect(slugs(restored)).toEqual(slugs(items))
  })

  it('知らない slug の枠は空のままにする', () => {
    const restored = slugParamsCodec.decode(new URLSearchParams('s1=a&s2=unknown'), characters)
    expect(slugs(restored)).toEqual(['a', null, null, null, null, null, null, null, null])
  })

  it('10 枠目以降は読まない', () => {
    const restored = slugParamsCodec.decode(new URLSearchParams('s10=a&s99=b'), characters)
    expect(slugs(restored).every((s) => s === null)).toBe(true)
  })

  it('常に 9 枠を返す', () => {
    expect(slugParamsCodec.decode(new URLSearchParams(''), characters)).toHaveLength(9)
  })
})

describe('compactIndexCodec', () => {
  it('キャラ配列の index を - で並べる（空欄は空文字）', () => {
    const params = compactIndexCodec.encode(itemsAt({ 1: 0, 3: 2 }), characters)
    expect(params.get('c')).toBe('0--2------')
  })

  it('index 0 のキャラも欠落しない', () => {
    const items = itemsAt({ 1: 0 })
    const restored = compactIndexCodec.decode(compactIndexCodec.encode(items, characters), characters)
    expect(restored[0].slug).toBe('a')
  })

  it('復元すると元の配置に戻る', () => {
    const items = itemsAt({ 2: 1, 4: 0, 9: 2 })
    const restored = compactIndexCodec.decode(
      compactIndexCodec.encode(items, characters),
      characters
    )
    expect(slugs(restored)).toEqual(slugs(items))
  })

  it('c が無ければ旧形式（s1..s9）で読む', () => {
    const restored = compactIndexCodec.decode(new URLSearchParams('s1=b&s3=c'), characters)
    expect(slugs(restored)).toEqual(['b', null, 'c', null, null, null, null, null, null])
  })

  it('c があるときは s パラメータへフォールバックしない', () => {
    const restored = compactIndexCodec.decode(new URLSearchParams('c=zzz&s1=a'), characters)
    expect(slugs(restored).every((s) => s === null)).toBe(true)
  })

  it('範囲外・数値でない index は無視する', () => {
    const restored = compactIndexCodec.decode(new URLSearchParams('c=0-99-x--2'), characters)
    expect(slugs(restored)).toEqual(['a', null, null, null, 'c', null, null, null, null])
  })

  // '-' が区切り文字なので、負の index はそもそも表現できない。
  // 先頭の '-' は「1 枠目が空」の意味になる。
  it('先頭の - は空枠として読む', () => {
    const restored = compactIndexCodec.decode(new URLSearchParams('c=-1'), characters)
    expect(slugs(restored)).toEqual([null, 'b', null, null, null, null, null, null, null])
  })

  it('9 個を超える指定は先頭 9 個だけ読む', () => {
    const restored = compactIndexCodec.decode(new URLSearchParams('c=0-0-0-0-0-0-0-0-0-1-1'), characters)
    expect(restored).toHaveLength(9)
    expect(slugs(restored).every((s) => s === 'a')).toBe(true)
  })

  it('空の 9 枠を往復させても空のまま', () => {
    const restored = compactIndexCodec.decode(
      compactIndexCodec.encode(createEmptyItems(), characters),
      characters
    )
    expect(slugs(restored).every((s) => s === null)).toBe(true)
  })
})

describe('toSelectedItem', () => {
  it('表示用はプロキシ経由、フォールバック用は元の URL を持つ', () => {
    const item = toSelectedItem(characters[0])
    expect(item.image).toBe('/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fa.png')
    expect(item.originalImage).toBe('https://example.com/a.png')
  })
})
