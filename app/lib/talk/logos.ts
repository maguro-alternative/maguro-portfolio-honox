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

/** ドルフィンウェーブのチーム。ロゴ一覧ではコラボより先に並べる。 */
const TEAM_IDS = [
  'kirishima',
  'kazamiseatec',
  'himuka',
  'urami',
  'fm-wadatsumi',
  'isrw',
  'grimo-goetia',
  'salacia',
  'galatea',
]

/** ファイル名から起こせない表記を補う。ここに無い id はファイル名がそのまま出る。 */
const LABELS: Record<string, string> = {
  // チーム
  kirishima: 'KIRISHIMA',
  kazamiseatec: 'KAZAMI SEATEC',
  himuka: '日向重工',
  urami: '浦見製鉄所',
  'fm-wadatsumi': 'FMワダツミ',
  isrw: 'ISRW',
  'grimo-goetia': 'GRIMO→GOETIA',
  salacia: 'Salacia',
  galatea: 'Galatea',
  // コラボタイトル
  'senran-kagura': '閃乱カグラ',
  doaxvv: 'DEAD OR ALIVE Xtreme Venus Vacation',
  toloveru: 'To LOVEる -とらぶる- ダークネス',
  xvlogo: '戦姫絶唱シンフォギアXV',
  'high-school-dxd-hero': 'ハイスクールD×D HERO',
  ryza: 'ライザのアトリエ',
  'kage-no-jitsuryokusha-ni-naritakute': '陰の実力者になりたくて！',
}

/**
 * ファイル名 → id。
 * 「logo_」「logo-」の接頭辞、`.svg.png` のような多重拡張子、記号や大小文字の揺れを吸収する。
 */
function toId(file: string) {
  return file
    .replace(/^logo[-_]/i, '')
    .replace(/(\.[a-z0-9]+)+$/i, '')
    .replace(/[_\s]+/g, '-')
    .replace(/[^0-9a-z-]/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .replace(/-logo$/, '')
}

export const talkLogos: TalkLogo[] = files
  .map((file) => {
    const id = toId(file)
    return { id, label: LABELS[id] ?? id, src: `${DIR}/${file}` }
  })
  .sort((a, b) => {
    const at = TEAM_IDS.indexOf(a.id)
    const bt = TEAM_IDS.indexOf(b.id)
    if (at !== bt) return (at < 0 ? TEAM_IDS.length : at) - (bt < 0 ? TEAM_IDS.length : bt)
    return a.label.localeCompare(b.label, 'ja')
  })

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
