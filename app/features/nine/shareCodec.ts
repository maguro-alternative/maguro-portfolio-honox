import {
  SLOT_COUNT,
  createEmptyItems,
  toSelectedItem,
  type NineCharacter,
  type SelectedItem,
} from './types'

export interface ShareCodec {
  encode(items: SelectedItem[], characters: readonly NineCharacter[]): URLSearchParams
  decode(params: URLSearchParams, characters: readonly NineCharacter[]): SelectedItem[]
}

/** `?s1=slug&s2=slug...` */
export const slugParamsCodec: ShareCodec = {
  encode(items) {
    const params = new URLSearchParams()
    items.forEach((item, index) => {
      if (item.slug) params.set(`s${index + 1}`, item.slug)
    })
    return params
  },

  decode(params, characters) {
    const items = createEmptyItems()
    for (let i = 1; i <= SLOT_COUNT; i++) {
      const slug = params.get(`s${i}`)
      if (!slug) continue
      const char = characters.find((c) => c.slug === slug)
      if (char) items[i - 1] = toSelectedItem(char)
    }
    return items
  },
}

/**
 * `?c=0-4--12...`（キャラ配列のインデックスを並べたもの）。
 * slug 方式より URL が短く済むが、キャラ配列の並びを変えると既存の共有 URL が壊れる。
 */
export const compactIndexCodec: ShareCodec = {
  encode(items, characters) {
    const slugToIndex = new Map(characters.map((c, i) => [c.slug, i]))
    const c = items
      .map((item) => {
        if (!item.slug) return ''
        const idx = slugToIndex.get(item.slug)
        return idx !== undefined ? String(idx) : ''
      })
      .join('-')
    return new URLSearchParams({ c })
  },

  decode(params, characters) {
    const c = params.get('c')
    // c が壊れていても slug 方式にはフォールバックしない。
    // 意図した並びと違うものを復元するより、空で始めたほうが混乱しないため。
    if (c === null) return slugParamsCodec.decode(params, characters)

    const items = createEmptyItems()
    const parts = c.split('-')
    for (let i = 0; i < Math.min(parts.length, SLOT_COUNT); i++) {
      if (parts[i] === '') continue
      const idx = parseInt(parts[i], 10)
      if (isNaN(idx) || idx < 0 || idx >= characters.length) continue
      items[i] = toSelectedItem(characters[idx])
    }
    return items
  },
}
