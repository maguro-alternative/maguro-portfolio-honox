import { logFailure } from './logFailure'

/** 実際に書き込む処理。テストから差し替えられるようにしてある */
export type ClipboardWriter = (text: string) => Promise<void>

const defaultWriter: ClipboardWriter = (text) => navigator.clipboard.writeText(text)

/**
 * クリップボードへ書き、成功したかを返す。
 *
 * writeText は Promise を返し、非セキュアコンテキスト（http）や権限拒否で reject する。
 * await せずに「コピーしました」と出すと、失敗しても成功したことになる。
 */
export async function copyText(text: string, write: ClipboardWriter = defaultWriter): Promise<boolean> {
  try {
    await write(text)
    return true
  } catch (error) {
    logFailure('clipboard/write', error, { length: text.length })
    return false
  }
}
