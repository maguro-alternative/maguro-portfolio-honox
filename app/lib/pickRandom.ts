/**
 * 一様ランダムに count 件を選ぶ（部分 Fisher-Yates）。
 *
 * `[...list].sort(() => Math.random() - 0.5)` は比較関数が非一貫なため一様にならず、
 * 実測では先頭の要素が期待の 2.2 倍、後方が 0.65 倍しか出なかった。
 *
 * random は差し替え可能にしてある。分布をテストで固定できるようにするため。
 */
export function pickRandom<T>(
  list: readonly T[],
  count: number,
  random: () => number = Math.random
): T[] {
  const pool = [...list]
  const n = Math.min(count, pool.length)
  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(random() * (pool.length - i))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, n)
}
