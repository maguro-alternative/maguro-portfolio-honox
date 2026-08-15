// vite-public-listing-plugin.ts が生成する仮想モジュール。
// public/talk/dolphin/ に置かれた画像のファイル名一覧をビルド時に受け取る。
declare module 'virtual:talk-logos' {
  export const files: string[]
}

// 同上。こちらは public/talk/shinomas/ の学園エンブレム。
declare module 'virtual:shinomas-emblems' {
  export const files: string[]
}
