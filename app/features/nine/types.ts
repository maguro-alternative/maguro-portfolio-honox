import { proxyUrl, type CharacterSlug, type NineCharacter, type ProxiedUrl, type SourceUrl } from '../../lib/nine/types'

export { proxyUrl }
export type { CharacterSlug, NineCharacter, ProxiedUrl, SourceUrl }

export interface SelectedItem {
  name: string
  /** canvas に描くのはこちら */
  image?: ProxiedUrl
  /** プロキシが落ちたときのフォールバック先 */
  originalImage?: SourceUrl
  slug?: CharacterSlug
}

export const SLOT_COUNT = 9

export function createEmptyItems(): SelectedItem[] {
  return Array(SLOT_COUNT)
    .fill(null)
    .map(() => ({ name: '' }))
}

export function toSelectedItem(char: NineCharacter): SelectedItem {
  return {
    name: char.name,
    image: proxyUrl(char.imageUrl),
    originalImage: char.imageUrl,
    slug: char.slug,
  }
}
