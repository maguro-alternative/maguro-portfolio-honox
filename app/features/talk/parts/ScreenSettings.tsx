import { TALK_ASPECTS, type TalkAspect } from '../../../lib/talk/renderTalk'
import type { TalkTheme } from '../theme'

/** 並び順がそのままチェックボックスの並びになる。 */
export interface TalkToggle {
  label: string
  value: boolean
  onChange(value: boolean): void
}

interface ScreenSettingsProps {
  aspect: TalkAspect
  onAspectChange(aspect: TalkAspect): void
  toggles: TalkToggle[]
  theme: TalkTheme
}

const ASPECTS = Object.keys(TALK_ASPECTS) as TalkAspect[]

export default function ScreenSettings({
  aspect,
  onAspectChange,
  toggles,
  theme,
}: ScreenSettingsProps) {
  return (
    <section className={`mt-4 space-y-3 ${theme.panel}`}>
      <h2 className={theme.panelTitle}>画面設定</h2>

      <div className="flex items-center gap-3">
        <span className={theme.label}>画面比率</span>
        <div className={theme.segmentGroup}>
          {ASPECTS.map((a) => (
            <button
              key={a}
              onClick={() => onAspectChange(a)}
              aria-pressed={aspect === a}
              className={`px-4 py-1.5 text-xs font-semibold ${
                aspect === a ? theme.segmentActive : theme.segmentIdle
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {toggles.map((toggle) => (
          <label key={toggle.label} className={theme.checkLabel}>
            <input
              type="checkbox"
              checked={toggle.value}
              onChange={(e) => toggle.onChange((e.currentTarget as HTMLInputElement).checked)}
            />
            {toggle.label}
          </label>
        ))}
      </div>
    </section>
  )
}
