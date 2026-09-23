import { describe, expect, it } from 'vitest'
import { collectSvgText } from './ogPng'

describe('collectSvgText', () => {
  it('text の中身を拾う', () => {
    const svg = '<svg><text x="1">あい</text><text>う</text></svg>'
    expect([...collectSvgText(svg)].sort().join('')).toBe('あいう')
  })

  it('text に入れ子の tspan も拾う', () => {
    const svg = '<svg><text><tspan>あい</tspan><tspan>うえ</tspan></text></svg>'
    expect([...collectSvgText(svg)].sort().join('')).toBe('あいうえ')
  })

  it('エスケープを戻してから数える', () => {
    const svg = '<svg><text>A&amp;B</text></svg>'
    expect([...collectSvgText(svg)].sort().join('')).toBe('&AB')
  })

  it('テキスト以外は拾わない', () => {
    const svg = '<svg><rect fill="#fff" /><image href="https://example.com/a.png" /></svg>'
    expect(collectSvgText(svg)).toBe('')
  })
})
