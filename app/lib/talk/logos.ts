// ネームプレートに置くチームロゴ。
// public/talk/dolphin/ に画像を置くだけで選択肢が増える。
// ファイル名の列挙はビルド時（vite-public-listing-plugin.ts）に済ませてあり、
// 画像そのものは public のパスからそのまま配信される。
import { files } from 'virtual:talk-logos'

const DIR = '/talk/dolphin'

export interface TalkLogo {
  id: string
  label: string
  src: string
}

/** ファイル名から起こせない表記だけ、ここで補う。 */
const LABELS: Record<string, string> = {
  kirishima: 'KIRISHIMA',
  kazamiseatec: 'KAZAMI SEATEC',
  himuka: '日向重工',
  urami: '浦見製鉄所',
  'fm-wadatsumi': 'FMワダツミ',
  isrw: 'ISRW',
  'grimo-goetia': 'GRIMO→GOETIA',
  salacia: 'Salacia',
  galatea: 'Galatea',
}

function toId(file: string) {
  return file.replace(/^logo[_-]/, '').replace(/\.[^.]+$/, '')
}

export const talkLogos: TalkLogo[] = files
  .map((file) => {
    const id = toId(file)
    return { id, label: LABELS[id] ?? id, src: `${DIR}/${file}` }
  })
  .sort((a, b) => a.label.localeCompare(b.label, 'ja'))

export function findLogo(id: string | null): TalkLogo | null {
  if (!id) return null
  return talkLogos.find((l) => l.id === id) ?? null
}

// dolphinCharacters の team 文字列 → ロゴ id。
// NereIdes は用意されている salacia / galatea のどちらに当たるか判断できないため未対応。
const LOGO_BY_CHARACTER_TEAM: Record<string, string> = {
  KIRISHIMA: 'kirishima',
  'KAZAMI TECH': 'kazamiseatec',
  日向重工: 'himuka',
  浦見製鉄所: 'urami',
  FMワダツミ: 'fm-wadatsumi',
  ISRW: 'isrw',
  'GRIMO→GOETIA': 'grimo-goetia',
}

export function logoIdForCharacterTeam(team: string): string | null {
  return LOGO_BY_CHARACTER_TEAM[team] ?? null
}
