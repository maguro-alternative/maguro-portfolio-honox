// 名前欄の左に添える学園エンブレム。public/talk/shinomas/cmn_sch_s*.png をそのまま使う。
// 番号と組織の対応は btl_sch* の幟画像から同定したもの。
// 05 だけ幟が未実装で同定できていないため、番号のまま出している。

const DIR = '/talk/shinomas'

export interface ShinomasEmblem {
  id: string
  label: string
  src: string
}

/** 抽出できたエンブレムを番号順に並べたもの。 */
const ENTRIES: [string, string][] = [
  ['s01', '国立半蔵学院'],
  ['s02', '焔紅蓮隊'],
  ['s03', '死塾月閃女学館'],
  ['s04', '秘立蛇女子学園'],
  ['s05', 'エンブレム05（不明）'],
  ['s06', 'ゾディアック星導会'],
  ['s07', '遠野天狗ノ忍衆'],
  ['s08', '巫神楽'],
  ['s11', '死塾月閃女学館 中等部'],
  ['s13', 'カグラ千年祭'],
  ['s14', '大会運営委員'],
  ['s23', 'New wave 連合'],
  ['s26', '天城封結衆'],
]

export const shinomasEmblems: ShinomasEmblem[] = ENTRIES.map(([id, label]) => ({
  id,
  label,
  src: `${DIR}/cmn_sch_${id}.png`,
}))

export function findShinomasEmblem(id: string | null): ShinomasEmblem | null {
  if (!id) return null
  return shinomasEmblems.find((e) => e.id === id) ?? null
}
