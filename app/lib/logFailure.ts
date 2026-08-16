/**
 * 握りつぶす代わりに記録する。
 *
 * 「どこで（scope）」「何が（cause）」「どの入力で（context）」の 3 点を必ず揃えるための入口。
 * console.warn を直接書くと scope や cause が抜けて、後からどの失敗か判別できなくなる。
 */
export function logFailure(scope: string, cause: unknown, context?: Record<string, unknown>): void {
  console.warn(`[${scope}] ${describeCause(cause)}`, { ...context, cause })
}

function describeCause(cause: unknown): string {
  if (cause instanceof Error) {
    return cause.message ? `${cause.name}: ${cause.message}` : cause.name
  }
  return String(cause)
}
