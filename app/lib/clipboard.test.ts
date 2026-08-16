import { afterEach, describe, expect, it, vi } from 'vitest'
import { copyText } from './clipboard'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('copyText', () => {
  it('書き込めたら true', async () => {
    await expect(copyText('hello', async () => {})).resolves.toBe(true)
  })

  it('渡した文字列をそのまま書き込む', async () => {
    const written: string[] = []
    await copyText('私を構成する9人', async (t) => {
      written.push(t)
    })
    expect(written).toEqual(['私を構成する9人'])
  })

  // 権限拒否や非セキュアコンテキスト（http）で reject する。
  // await していなかった頃は、失敗しても「コピーしました！」と出ていた。
  it('reject したら false を返し、握りつぶさず記録する', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const denied = async () => {
      throw new DOMException('Write permission denied.', 'NotAllowedError')
    }

    await expect(copyText('x', denied)).resolves.toBe(false)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0][0])).toContain('clipboard/write')
  })

  it('同期的に throw しても false になる', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const broken = (() => {
      throw new TypeError('navigator.clipboard is undefined')
    }) as unknown as (text: string) => Promise<void>

    await expect(copyText('x', broken)).resolves.toBe(false)
  })
})
