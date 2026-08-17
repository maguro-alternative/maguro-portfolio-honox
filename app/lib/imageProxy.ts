/**
 * サーバ側 fetch なので、ここを緩めると任意の URL を取りに行かせられる（SSRF）。
 * hostname.includes(...) だと `hpgames.jp.example.com` が通ってしまうため、
 * 完全一致か「.」区切りのサブドメインだけを許す。
 */
const ALLOWED_HOSTS = ['hpgames.jp', 'www.marv.jp', 'seesaawiki.jp']

export function isAllowedImageHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return ALLOWED_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
}

/**
 * 判定に通らない理由（不正な URL / 非 https / 許可外ホスト）は呼び出し側で区別しない。
 * どれも「その URL は中継しない」で扱いが同じで、外に理由を出すと探索の助けになるため。
 */
export function parseProxyTarget(raw: string): URL | null {
  let url: URL
  try {
    url = new URL(raw)
  } catch (_error) {
    // URL として解釈できない時点で中継対象外。理由を残す価値がない
    return null
  }
  // http: や data: を許すと社内ネットワークやローカルファイルへ届きうる
  if (url.protocol !== 'https:') return null
  return isAllowedImageHost(url.hostname) ? url : null
}
