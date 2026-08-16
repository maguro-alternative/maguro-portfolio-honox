import type { Brand } from '../brand'

/** 公式サイトの画像 URL。canvas に直接描くと汚染されて toDataURL が失敗する。 */
export type SourceUrl = Brand<string, 'SourceUrl'>

/** /api/image-proxy を通した URL。canvas に描けるのはこちらだけ。 */
export type ProxiedUrl = Brand<string, 'ProxiedUrl'>

export type CharacterSlug = Brand<string, 'CharacterSlug'>

export interface NineCharacter {
  name: string
  reading: string
  team: string
  slug: CharacterSlug
  imageUrl: SourceUrl
}

/** データファイルのリテラル用。ブランドを付ける前の生の形。 */
export interface RawNineCharacter {
  name: string
  reading: string
  team: string
  slug: string
  imageUrl: string
}

/**
 * キャラ一覧にブランドを付ける唯一の入口。実行時は素通しで、付け替えは型の上だけ。
 * ここ以外で SourceUrl / CharacterSlug を作らないこと。
 */
export function defineCharacters(list: readonly RawNineCharacter[]): readonly NineCharacter[] {
  return list as readonly NineCharacter[]
}

/** SourceUrl を ProxiedUrl に変える唯一の入口。 */
export function proxyUrl(imageUrl: SourceUrl): ProxiedUrl {
  return `/api/image-proxy?url=${encodeURIComponent(imageUrl)}` as ProxiedUrl
}
