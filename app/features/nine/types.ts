export interface NineCharacter {
  name: string
  reading: string
  team: string
  slug: string
  imageUrl: string
}

export interface SelectedItem {
  name: string
  image?: string
  originalImage?: string
  slug?: string
}

export const SLOT_COUNT = 9

export function createEmptyItems(): SelectedItem[] {
  return Array(SLOT_COUNT)
    .fill(null)
    .map(() => ({ name: '' }))
}

// 公式サイトの画像は直リンクだと CORS で canvas が汚染され toDataURL が使えなくなるため、
// 自前のプロキシ経由にしている。
export function proxyUrl(imageUrl: string): string {
  return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`
}

export function toSelectedItem(char: NineCharacter): SelectedItem {
  return {
    name: char.name,
    image: proxyUrl(char.imageUrl),
    originalImage: char.imageUrl,
    slug: char.slug,
  }
}
