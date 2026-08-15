// 名前欄の左に添える学園エンブレム。
// public/talk/shinomas/ に画像を置くだけで選択肢が増える（ドルフィン版の logos.ts と同じ規則）。
// ファイル名の列挙はビルド時（vite-public-listing-plugin.ts）に済ませてあり、
// 画像そのものは public のパスからそのまま配信される。
import { files } from 'virtual:shinomas-emblems'

const DIR = '/talk/shinomas'

export interface ShinomasEmblem {
  id: string
  label: string
  src: string
}

/**
 * 実機での並び順。ゲーム内のエンブレム番号（cmn_sch_s01〜s26）に対応する。
 * ここに無い id は後ろに回る。
 * s05（組織を同定できなかったもの）と s13（カグラ千年祭）は外してある。
 */
const ORDER = [
  'hanzo', // s01
  'homura', // s02
  'gessen', // s03
  'hebijo', // s04
  'zodiac', // s06
  'tono-tengu', // s07
  'mikagura', // s08
  'gessen-chutobu', // s11
  'taikai-unei', // s14
  'new-wave', // s23
  'amagi', // s26
]

/**
 * ファイル名から起こせない表記を補う。ここに無い id はファイル名がそのまま出る。
 * 組織名は btl_sch* の幟画像から同定したもの。
 */
const LABELS: Record<string, string> = {
  hanzo: '国立半蔵学院',
  homura: '焔紅蓮隊',
  gessen: '死塾月閃女学館',
  hebijo: '秘立蛇女子学園',
  zodiac: 'ゾディアック星導会',
  'tono-tengu': '遠野天狗ノ忍衆',
  mikagura: '巫神楽',
  'gessen-chutobu': '死塾月閃女学館 中等部',
  'taikai-unei': '大会運営委員',
  'new-wave': 'New wave 連合',
  amagi: '天城封結衆',
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

export const shinomasEmblems: ShinomasEmblem[] = files
  .map((file) => {
    const id = toId(file)
    return { id, label: LABELS[id] ?? id, src: `${DIR}/${file}` }
  })
  .sort((a, b) => {
    const ai = ORDER.indexOf(a.id)
    const bi = ORDER.indexOf(b.id)
    if (ai !== bi) return (ai < 0 ? ORDER.length : ai) - (bi < 0 ? ORDER.length : bi)
    return a.label.localeCompare(b.label, 'ja')
  })

export function findShinomasEmblem(id: string | null): ShinomasEmblem | null {
  if (!id) return null
  return shinomasEmblems.find((e) => e.id === id) ?? null
}
