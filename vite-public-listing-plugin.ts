import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

const EXTENSIONS = /\.(png|webp|jpe?g|svg)$/i

/** 仮想モジュール名と、列挙する public 配下のディレクトリ。 */
const LISTINGS = [
  { virtualId: 'virtual:talk-logos', dir: 'public/talk/dolphin' },
  { virtualId: 'virtual:shinomas-emblems', dir: 'public/talk/shinomas' },
] as const

const resolvedId = (virtualId: string) => '\0' + virtualId

/**
 * セリフメーカーのロゴ／エンブレム置き場のファイル名をビルド時に列挙して仮想モジュールで渡す。
 *
 * import.meta.glob だと Vite が public 配下の画像を assets にも複製してしまうため、
 * ここではファイル名だけを取り出し、実体は public のパスからそのまま配信させる。
 * fs を触るのはビルド時のみで、生成されるのは文字列配列だけ。
 */
export default function talkLogosPlugin(): Plugin {
  let root = process.cwd()

  const listFiles = (dir: string) => {
    try {
      return readdirSync(resolve(root, dir))
        .filter((name) => EXTENSIONS.test(name))
        .sort()
    } catch {
      return []
    }
  }

  return {
    name: 'talk-logos-listing',
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      const hit = LISTINGS.find((l) => l.virtualId === id)
      return hit ? resolvedId(hit.virtualId) : undefined
    },
    load(id) {
      const hit = LISTINGS.find((l) => resolvedId(l.virtualId) === id)
      if (!hit) return
      return `export const files = ${JSON.stringify(listFiles(hit.dir))}`
    },
    configureServer(server) {
      // 開発中にファイルを足したら選択肢に反映されるよう、仮想モジュールを無効化する
      const invalidate = (file: string) => {
        const hit = LISTINGS.find((l) => file.includes(l.dir))
        if (!hit) return
        const mod = server.moduleGraph.getModuleById(resolvedId(hit.virtualId))
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      for (const { dir } of LISTINGS) server.watcher.add(resolve(root, dir))
      server.watcher.on('add', invalidate)
      server.watcher.on('unlink', invalidate)
    },
  }
}
