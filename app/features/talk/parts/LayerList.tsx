import type { TalkEditor } from '../useTalkEditor'
import { ZOOM_MAX, ZOOM_MIN } from '../useTalkEditor'
import type { TalkTheme } from '../theme'

interface LayerListProps {
  editor: TalkEditor
  theme: TalkTheme
}

export default function LayerList({ editor, theme }: LayerListProps) {
  const { layers, selectedId, updateLayer } = editor

  return (
    <section className={`mt-4 space-y-3 ${theme.panel}`}>
      <h2 className={theme.panelTitle}>
        写真 {layers.length > 0 && <span className={theme.muted}>（{layers.length}枚）</span>}
      </h2>

      {layers.length === 0 ? (
        <p className={theme.emptyText}>「写真を追加」から画像を読み込んでください</p>
      ) : (
        <ul className="space-y-2">
          {/* 一覧は前面が上に来るよう、描画順の逆で並べる */}
          {[...layers].reverse().map((layer) => {
            const isSelected = layer.id === selectedId
            return (
              <li
                key={layer.id}
                className={`rounded-md border p-2 ${
                  isSelected ? theme.itemSelected : theme.itemIdle
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => editor.selectLayer(layer.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <img src={layer.url} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
                    <span className={theme.itemLabel}>{layer.label}</span>
                  </button>
                  <button
                    onClick={() => editor.moveLayer(layer.id, 1)}
                    aria-label="前面へ"
                    className={theme.iconButton}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => editor.moveLayer(layer.id, -1)}
                    aria-label="背面へ"
                    className={theme.iconButton}
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => editor.removeLayer(layer.id)}
                    aria-label="削除"
                    className={theme.dangerButton}
                  >
                    ✕
                  </button>
                </div>

                {isSelected && (
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min={String(ZOOM_MIN)}
                      max={String(ZOOM_MAX)}
                      step="0.01"
                      value={String(layer.zoom)}
                      onInput={(e) =>
                        updateLayer(layer.id, {
                          zoom: Number((e.currentTarget as HTMLInputElement).value),
                        })
                      }
                      className="flex-1"
                    />
                    <button
                      onClick={() => editor.centerLayer(layer.id)}
                      className={theme.subtleButton}
                    >
                      中央に戻す
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
