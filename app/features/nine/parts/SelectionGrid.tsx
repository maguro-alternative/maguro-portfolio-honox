import type { SelectedItem } from '../types'

interface SelectionGridProps {
  selectedItems: SelectedItem[]
  onPanelClick(index: number): void
  onClearPanel(index: number): void
  /** 空きスロットの絵柄はゲームごとに丸ごと違うので、中身を呼び出し側から渡す */
  emptyClassName: string
  renderEmpty(index: number): unknown
}

export default function SelectionGrid({
  selectedItems,
  onPanelClick,
  onClearPanel,
  emptyClassName,
  renderEmpty,
}: SelectionGridProps) {
  return (
    <div className="-mx-4 mb-6 grid grid-cols-3 gap-2 px-2 sm:mx-0 sm:px-0">
      {selectedItems.map((item, index) => (
        <div key={index} className="relative">
          {item.name ? (
            <button
              onClick={() => onPanelClick(index)}
              aria-label={`${item.name} を変更`}
              className="group relative aspect-square w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100 p-0"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1 pb-1.5 pt-5">
                <p className="truncate text-center text-xs font-bold text-white drop-shadow-sm">
                  {item.name}
                </p>
              </div>
              {/* button のネストは不正な HTML になるので div + role で代用している */}
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  onClearPanel(index)
                }}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="クリア"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </button>
          ) : (
            <button
              onClick={() => onPanelClick(index)}
              aria-label={`スロット ${index + 1} にキャラクターを追加`}
              className={emptyClassName}
            >
              {renderEmpty(index)}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
