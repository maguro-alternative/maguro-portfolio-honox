import { useRef, useState, type RefObject } from 'hono/jsx'
import type { TalkLayer } from '../../lib/talk/renderTalk'
import { logFailure } from '../../lib/logFailure'

export interface PhotoLayer extends TalkLayer {
  url: string
  label: string
}

export const ZOOM_MIN = 0.15
export const ZOOM_MAX = 5

let layerSeq = 0

function loadFile(file: File): Promise<PhotoLayer> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () =>
      resolve({
        id: `layer-${++layerSeq}`,
        label: file.name.replace(/\.[^.]+$/, ''),
        url,
        image,
        offX: 0,
        offY: 0,
        zoom: 1,
      })
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('画像を読み込めませんでした'))
    }
    image.src = url
  })
}

export interface TalkEditorOptions {
  downloadName: string
}

export interface TalkEditor {
  /** 背面から前面の順。描画順とそのまま対応する */
  layers: PhotoLayer[]
  selectedId: string | null
  selected: PhotoLayer | null
  canvasRef: RefObject<HTMLCanvasElement>
  selectLayer(id: string | null): void
  updateLayer(id: string, patch: Partial<PhotoLayer>): void
  openPicker(): void
  removeLayer(id: string): void
  /** dir: 1 で前面、-1 で背面へ 1 つ動かす */
  moveLayer(id: string, dir: -1 | 1): void
  centerLayer(id: string): void
  clearLayers(): void
  download(): void
}

export function useTalkEditor({ downloadName }: TalkEditorOptions): TalkEditor {
  const [layers, setLayers] = useState<PhotoLayer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const selected = layers.find((l) => l.id === selectedId) ?? null

  const updateLayer = (id: string, patch: Partial<PhotoLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const loaded: PhotoLayer[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      try {
        loaded.push(await loadFile(file))
      } catch (error) {
        // 1 枚読めなくても残りは追加する。UI への通知は未実装
        logFailure('talk/load-file', error, { fileName: file.name })
      }
    }
    if (loaded.length === 0) return
    setLayers((prev) => [...prev, ...loaded])
    setSelectedId(loaded[loaded.length - 1].id)
  }

  // hono/jsx の onChange は input イベントに割り当てられ file input と相性が悪いので、
  // 隠し input を JSX に置かず、クリックのたびに使い捨ての input を作って change を拾う。
  const openPicker = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    input.onchange = () => void addFiles(input.files)
    input.click()
  }

  const removeLayer = (id: string) => {
    setLayers((prev) => {
      const target = prev.find((l) => l.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((l) => l.id !== id)
    })
    setSelectedId((prev) => (prev === id ? null : prev))
  }

  const moveLayer = (id: string, dir: -1 | 1) => {
    setLayers((prev) => {
      const i = prev.findIndex((l) => l.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  const centerLayer = (id: string) => {
    updateLayer(id, { offX: 0, offY: 0, zoom: 1 })
  }

  const clearLayers = () => {
    setLayers((prev) => {
      for (const layer of prev) URL.revokeObjectURL(layer.url)
      return []
    })
    setSelectedId(null)
  }

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadName
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return {
    layers,
    selectedId,
    selected,
    canvasRef,
    selectLayer: setSelectedId,
    updateLayer,
    openPicker,
    removeLayer,
    moveLayer,
    centerLayer,
    clearLayers,
    download,
  }
}
