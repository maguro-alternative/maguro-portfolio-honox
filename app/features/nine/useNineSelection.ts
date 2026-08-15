import { useState, useMemo, useEffect } from 'hono/jsx'
import type { ShareCodec } from './shareCodec'
import { createEmptyItems, toSelectedItem, type NineCharacter, type SelectedItem } from './types'

export interface NineConfig {
  characters: NineCharacter[]
  /** シェア URL のパス。例: '/nine/kagura' */
  pagePath: string
  /** OG 画像 API のパス。例: '/api/og/kagura' */
  ogPath: string
  /** 完成したシェア URL を受け取って、投稿本文を組み立てる */
  buildShareText(url: string): string
  codec: ShareCodec
}

export interface NineSelection {
  selectedItems: SelectedItem[]
  selectedCount: number
  shareText: string
  selectCharacter(index: number, char: NineCharacter): void
  randomize(): void
  reset(): void
  clearPanel(index: number): void
  copyShareText(): void
}

export function useNineSelection(config: NineConfig): NineSelection {
  const { characters, pagePath, ogPath, buildShareText, codec } = config
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(createEmptyItems())

  // SSR 中は window が無いので、URL を組み立てられない
  const shareText = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const params = codec.encode(selectedItems, characters)
    return buildShareText(`${window.location.origin}${pagePath}?${params.toString()}`)
  }, [selectedItems])

  const selectedCount = selectedItems.filter((item) => item.name).length

  const applyItems = (items: SelectedItem[]) => {
    setSelectedItems(items)
    if (typeof window === 'undefined') return
    const params = codec.encode(items, characters)
    const url = `${window.location.origin}${ogPath}?${params.toString()}`
    const set = (property: string, attr: 'property' | 'name') => {
      let el = document.querySelector(`meta[${attr}="${property}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, property)
        document.head.appendChild(el)
      }
      el.setAttribute('content', url)
    }
    set('og:image', 'property')
    set('twitter:image', 'name')
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const items = codec.decode(new URLSearchParams(window.location.search), characters)
    if (items.some((item) => item.name)) applyItems(items)
  }, [])

  return {
    selectedItems,
    selectedCount,
    shareText,

    selectCharacter(index, char) {
      const next = [...selectedItems]
      next[index] = toSelectedItem(char)
      applyItems(next)
    },

    randomize() {
      const shuffled = [...characters].sort(() => Math.random() - 0.5)
      applyItems(shuffled.slice(0, 9).map(toSelectedItem))
    },

    reset() {
      applyItems(createEmptyItems())
    },

    clearPanel(index) {
      const next = [...selectedItems]
      next[index] = { name: '' }
      applyItems(next)
    },

    copyShareText() {
      navigator.clipboard.writeText(shareText)
      alert('コピーしました！')
    },
  }
}
