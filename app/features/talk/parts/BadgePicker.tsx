// エンブレム / チームロゴのような「画像 1 枚から選ぶ」ピッカー。
import type { TalkTheme } from '../theme'

/** ShinomasEmblem / TalkLogo のどちらも構造は同じなのでこれで受ける。 */
export interface BadgeItem {
  id: string
  label: string
  src: string
}

interface BadgePickerProps {
  /** 「所属（エンブレム）」など */
  label: string
  /** 未選択のときに出す名前。「エンブレムなし」など */
  noneLabel: string
  items: BadgeItem[]
  value: string | null
  onChange(id: string | null): void
  /**
   * ボタンの寸法。エンブレムは正方形、チームロゴは横長なので呼び出し側で決める。
   * 例: 'h-11 w-11'
   */
  swatchSize: string
  theme: TalkTheme
}

export default function BadgePicker({
  label,
  noneLabel,
  items,
  value,
  onChange,
  swatchSize,
  theme,
}: BadgePickerProps) {
  const currentLabel = items.find((i) => i.id === value)?.label ?? noneLabel

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={theme.label}>{label}</span>
        <span className={`truncate ${theme.muted}`}>{currentLabel}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <button
          onClick={() => onChange(null)}
          title={noneLabel}
          aria-label={noneLabel}
          aria-pressed={value === null}
          className={`flex ${swatchSize} items-center justify-center rounded-md border ${theme.swatch} ${
            theme.swatchNone
          } ${value === null ? theme.swatchSelected : theme.swatchIdle}`}
        >
          なし
        </button>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            title={item.label}
            aria-label={item.label}
            aria-pressed={value === item.id}
            className={`flex ${swatchSize} items-center justify-center rounded-md border p-1 ${
              theme.swatch
            } ${value === item.id ? theme.swatchSelected : theme.swatchIdle}`}
          >
            <img src={item.src} alt="" className="max-h-full min-w-0 max-w-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  )
}
