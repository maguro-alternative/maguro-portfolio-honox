// セリフメーカーの操作パネルで、ゲームごとに変わる Tailwind クラスをまとめたもの。
// Tailwind v4 の JIT はクラス名を静的に走査するので、
// `bg-${color}-700` のような組み立てはせず、必ずフルのクラス名を書くこと。

export interface TalkTheme {
  /** 操作パネルのカード */
  panel: string
  panelTitle: string
  /** 見出し・項目名 */
  label: string
  /** 補足テキスト（選択中の名前、枚数など） */
  muted: string

  /** 選択肢ボタン（エンブレム / ロゴ）の下地 */
  swatch: string
  swatchSelected: string
  swatchIdle: string
  /** 「なし」ボタンだけに足す文字色まわり */
  swatchNone: string

  /** 写真一覧の各項目 */
  itemSelected: string
  itemIdle: string
  itemLabel: string
  /** 写真が 1 枚も無いときの案内文 */
  emptyText: string

  /** ↑ ↓ の小ボタン */
  iconButton: string
  /** ✕ ボタン */
  dangerButton: string
  /** 「中央に戻す」 */
  subtleButton: string

  /** 画面比率のセグメントトグル */
  segmentGroup: string
  segmentActive: string
  segmentIdle: string
  /** チェックボックスの行 */
  checkLabel: string
}

export const shinomasTheme: TalkTheme = {
  panel: 'rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-sm',
  panelTitle: 'text-sm font-bold text-slate-200',
  label: 'text-xs font-semibold text-slate-300',
  muted: 'text-xs text-slate-400',

  swatch: 'bg-slate-900',
  swatchSelected: 'border-red-500 ring-2 ring-red-500/40',
  swatchIdle: 'border-slate-600',
  swatchNone: 'text-[10px] font-semibold text-slate-400',

  itemSelected: 'border-red-500 bg-red-950/40',
  itemIdle: 'border-slate-600',
  itemLabel: 'truncate text-xs text-slate-200',
  emptyText: 'py-4 text-center text-xs text-slate-500',

  iconButton: 'rounded border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700',
  dangerButton: 'rounded border border-red-800 px-2 py-1 text-xs text-red-400 hover:bg-red-950',
  subtleButton:
    'shrink-0 rounded border border-slate-600 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:bg-slate-700',

  segmentGroup: 'flex overflow-hidden rounded-md border border-slate-600',
  segmentActive: 'bg-red-700 text-white',
  segmentIdle: 'bg-slate-900 text-slate-300',
  checkLabel: 'flex items-center gap-2 text-xs text-slate-300',
}

export const dolphinTheme: TalkTheme = {
  panel: 'rounded-lg border border-slate-200 bg-white p-4 shadow-sm',
  panelTitle: 'text-sm font-bold text-slate-700',
  label: 'text-xs font-semibold text-slate-600',
  muted: 'text-xs text-slate-400',

  swatch: 'bg-white',
  swatchSelected: 'border-indigo-400 ring-2 ring-indigo-200',
  swatchIdle: 'border-slate-200',
  swatchNone: 'text-[10px] font-semibold text-slate-500',

  itemSelected: 'border-indigo-400 bg-indigo-50',
  itemIdle: 'border-slate-200',
  itemLabel: 'truncate text-xs text-slate-700',
  emptyText: 'py-4 text-center text-xs text-slate-400',

  iconButton: 'rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50',
  dangerButton: 'rounded border border-red-200 px-2 py-1 text-xs text-red-500 hover:bg-red-50',
  subtleButton:
    'shrink-0 rounded border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50',

  segmentGroup: 'flex overflow-hidden rounded-md border border-slate-300',
  segmentActive: 'bg-indigo-600 text-white',
  segmentIdle: 'bg-white text-slate-600',
  checkLabel: 'flex items-center gap-2 text-xs text-slate-600',
}
