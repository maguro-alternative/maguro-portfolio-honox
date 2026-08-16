import { describe, expect, it } from 'vitest'
import { isAllowedImageHost, parseProxyTarget } from './imageProxy'

describe('isAllowedImageHost', () => {
  it('許可ホストそのものを通す', () => {
    expect(isAllowedImageHost('hpgames.jp')).toBe(true)
    expect(isAllowedImageHost('www.marv.jp')).toBe(true)
  })

  it('サブドメインを通す（キャラ画像は image01/02.seesaawiki.jp から来る）', () => {
    expect(isAllowedImageHost('image01.seesaawiki.jp')).toBe(true)
    expect(isAllowedImageHost('image02.seesaawiki.jp')).toBe(true)
  })

  it('大文字を含んでいても通す', () => {
    expect(isAllowedImageHost('HPGames.JP')).toBe(true)
  })

  // includes 判定だった頃はここが全部通っていた
  it('許可ホストを名前の一部に含むだけの別ホストは拒否する', () => {
    expect(isAllowedImageHost('hpgames.jp.example.com')).toBe(false)
    expect(isAllowedImageHost('evil-hpgames.jp.co')).toBe(false)
    expect(isAllowedImageHost('notseesaawiki.jp.example.net')).toBe(false)
    expect(isAllowedImageHost('seesaawiki.jp.attacker.test')).toBe(false)
  })

  it('接尾辞が似ているだけのホストは拒否する', () => {
    expect(isAllowedImageHost('xhpgames.jp')).toBe(false)
    expect(isAllowedImageHost('marv.jp')).toBe(false)
  })

  it('無関係なホストは拒否する', () => {
    expect(isAllowedImageHost('example.com')).toBe(false)
    expect(isAllowedImageHost('localhost')).toBe(false)
  })
})

describe('parseProxyTarget', () => {
  it('許可ホストの https を通す', () => {
    expect(parseProxyTarget('https://hpgames.jp/a.png')?.hostname).toBe('hpgames.jp')
  })

  it('https 以外は拒否する', () => {
    expect(parseProxyTarget('http://hpgames.jp/a.png')).toBeNull()
    expect(parseProxyTarget('data:image/png;base64,AAAA')).toBeNull()
    expect(parseProxyTarget('file:///etc/passwd')).toBeNull()
  })

  it('URL として壊れていれば拒否する', () => {
    expect(parseProxyTarget('not a url')).toBeNull()
    expect(parseProxyTarget('')).toBeNull()
  })

  it('許可外ホストは拒否する', () => {
    expect(parseProxyTarget('https://hpgames.jp.example.com/a.png')).toBeNull()
    expect(parseProxyTarget('https://169.254.169.254/latest/meta-data/')).toBeNull()
  })

  it('認証情報付きで許可ホストを装っても拒否する', () => {
    // hostname は example.com になる
    expect(parseProxyTarget('https://hpgames.jp@example.com/a.png')).toBeNull()
  })
})
