// Canvas API で「9人」画像を生成する（外部ライブラリ不要）。
// kagura は正方形カード、dolphin は 16:9 カードのため imageAspect で切り替える。
interface DownloadItem {
  name: string
  image?: string
  originalImage?: string
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function loadItemImage(
  item: DownloadItem
): Promise<HTMLImageElement | null> {
  if (!item.image) return null
  const urls = [item.image, item.originalImage].filter(Boolean) as string[]
  for (const url of urls) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const img = await loadImage(blobUrl)
      URL.revokeObjectURL(blobUrl)
      return img
    } catch {
      continue
    }
  }
  return null
}

export async function generateCanvasImage(
  title: string,
  selectedItems: DownloadItem[],
  imageAspect: 'square' | 'video' = 'square'
): Promise<string> {
  const SCALE = 2
  const W = 900
  const PAD = 24
  const GAP = 12
  const COLS = 3
  const TITLE_FONT_SIZE = 24
  const LABEL_FONT_SIZE = 14
  const LABEL_HEIGHT = 32
  const BORDER = 2
  const BORDER_RADIUS = 8

  const contentW = W - PAD * 2
  const cardW = (contentW - GAP * (COLS - 1)) / COLS
  const imgH = imageAspect === 'video' ? Math.round((cardW * 9) / 16) : cardW
  const cardH = imgH + LABEL_HEIGHT
  const ROWS = 3
  const titleAreaH = TITLE_FONT_SIZE + 20
  const gridH = cardH * ROWS + GAP * (ROWS - 1)
  const H = PAD + titleAreaH + gridH + PAD

  const canvas = document.createElement('canvas')
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')!
  ctx.scale(SCALE, SCALE)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 1
  roundRect(ctx, PAD - 1, PAD - 1, contentW + 2, titleAreaH + gridH + PAD + 2, BORDER_RADIUS)
  ctx.stroke()

  ctx.fillStyle = '#1e293b'
  ctx.font = `bold ${TITLE_FONT_SIZE}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(title, W / 2, PAD + TITLE_FONT_SIZE)

  const images = await Promise.all(selectedItems.map(loadItemImage))

  for (let i = 0; i < 9; i++) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x = PAD + col * (cardW + GAP)
    const y = PAD + titleAreaH + row * (cardH + GAP)

    ctx.save()
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = BORDER
    roundRect(ctx, x, y, cardW, cardH, BORDER_RADIUS)
    ctx.stroke()

    ctx.beginPath()
    roundRect(ctx, x, y, cardW, cardH, BORDER_RADIUS)
    ctx.clip()

    const img = images[i]
    if (img) {
      const imgAspect = img.naturalWidth / img.naturalHeight
      const slotAspect = cardW / imgH
      let sx = 0,
        sy = 0,
        sw = img.naturalWidth,
        sh = img.naturalHeight
      if (imgAspect > slotAspect) {
        sw = img.naturalHeight * slotAspect
        sx = (img.naturalWidth - sw) / 2
      } else {
        sh = img.naturalWidth / slotAspect
        sy = (img.naturalHeight - sh) / 2
      }
      ctx.drawImage(img, sx, sy, sw, sh, x, y, cardW, imgH)
    } else {
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(x, y, cardW, imgH)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('No Image', x + cardW / 2, y + imgH / 2 + 4)
    }

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(x, y + imgH, cardW, LABEL_HEIGHT)

    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${LABEL_FONT_SIZE}px sans-serif`
    ctx.textAlign = 'center'
    const labelText = `${i + 1}. ${selectedItems[i].name || '未選択'}`
    ctx.fillText(labelText, x + cardW / 2, y + imgH + LABEL_HEIGHT / 2 + LABEL_FONT_SIZE / 3)

    ctx.restore()
  }

  return canvas.toDataURL('image/png')
}
