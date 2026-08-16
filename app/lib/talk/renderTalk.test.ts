import { describe, expect, it } from 'vitest'
import { layerRect, talkCanvasSize, type TalkImageSource, type TalkLayer } from './renderTalk'

/** naturalWidth/Height だけ持つ最小の画像ソース。canvas 実体は要らない。 */
function image(w: number, h: number): TalkImageSource {
  return { naturalWidth: w, naturalHeight: h, width: w, height: h } as TalkImageSource
}

function layer(img: TalkImageSource, patch: Partial<TalkLayer> = {}): TalkLayer {
  return { id: 'l1', image: img, offX: 0, offY: 0, zoom: 1, ...patch }
}

describe('talkCanvasSize', () => {
  it('16:9 は 1920x1080', () => {
    expect(talkCanvasSize('16:9')).toEqual({ width: 1920, height: 1080 })
  })

  it('4:3 は 1920x1440', () => {
    expect(talkCanvasSize('4:3')).toEqual({ width: 1920, height: 1440 })
  })

  it('幅を指定すると高さが比率から決まる', () => {
    expect(talkCanvasSize('16:9', 1280)).toEqual({ width: 1280, height: 720 })
  })
})

describe('layerRect', () => {
  const W = 1920
  const H = 1080

  it('zoom=1 でキャンバスを覆い、はみ出しは上下左右に均等', () => {
    // 正方形の画像を 16:9 に置くと、幅を合わせると縦が余るので高さ基準で覆う
    const r = layerRect(layer(image(1000, 1000)), W, H)
    expect(r.w).toBeCloseTo(1920)
    expect(r.h).toBeCloseTo(1920)
    expect(r.x).toBeCloseTo(0)
    expect(r.y).toBeCloseTo((H - 1920) / 2)
    // 覆えていること
    expect(r.w).toBeGreaterThanOrEqual(W)
    expect(r.h).toBeGreaterThanOrEqual(H)
  })

  it('キャンバスと同じ比率ならぴったり収まる', () => {
    const r = layerRect(layer(image(1920, 1080)), W, H)
    expect(r).toEqual({ x: 0, y: 0, w: 1920, h: 1080 })
  })

  it('横長すぎる画像は高さが合い、幅がはみ出す', () => {
    const r = layerRect(layer(image(4000, 1000)), W, H)
    expect(r.h).toBeCloseTo(H)
    expect(r.w).toBeGreaterThan(W)
    expect(r.x).toBeCloseTo((W - r.w) / 2)
  })

  it('zoom は中心を保ったまま拡大する', () => {
    const base = layerRect(layer(image(1920, 1080)), W, H)
    const zoomed = layerRect(layer(image(1920, 1080), { zoom: 2 }), W, H)
    expect(zoomed.w).toBeCloseTo(base.w * 2)
    expect(zoomed.h).toBeCloseTo(base.h * 2)
    // 中心がずれない
    expect(zoomed.x + zoomed.w / 2).toBeCloseTo(base.x + base.w / 2)
    expect(zoomed.y + zoomed.h / 2).toBeCloseTo(base.y + base.h / 2)
  })

  it('offX/offY はキャンバスの幅・高さを 1 とした割合で効く', () => {
    const r = layerRect(layer(image(1920, 1080), { offX: 0.5, offY: -0.25 }), W, H)
    expect(r.x).toBeCloseTo(0 + W * 0.5)
    expect(r.y).toBeCloseTo(0 - H * 0.25)
  })

  it('ずれは出力解像度に依らず同じ見え方になる', () => {
    const l = layer(image(1000, 1000), { offX: 0.25, zoom: 1.5 })
    const big = layerRect(l, 1920, 1080)
    const small = layerRect(l, 960, 540)
    // 幅で正規化すると一致する
    expect(big.x / 1920).toBeCloseTo(small.x / 960)
    expect(big.w / 1920).toBeCloseTo(small.w / 960)
  })

  it('サイズを読めない画像は空の矩形を返す', () => {
    expect(layerRect(layer(image(0, 0)), W, H)).toEqual({ x: 0, y: 0, w: 0, h: 0 })
  })

  it('naturalWidth が無ければ width を使う', () => {
    const img = { width: 1920, height: 1080 } as TalkImageSource
    expect(layerRect(layer(img), W, H)).toEqual({ x: 0, y: 0, w: 1920, h: 1080 })
  })
})
