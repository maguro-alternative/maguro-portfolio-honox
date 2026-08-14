import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

const VIRTUAL_ID = 'virtual:talk-logos'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const DIR = 'public/talk/dolphin'
const EXTENSIONS = /\.(png|webp|jpe?g|svg)$/i

/**
 * public/talk/dolphin/ のファイル名をビルド時に列挙して仮想モジュールで渡す。
 *
 * import.meta.glob だと Vite が public 配下の画像を assets にも複製してしまうため、
 * ここではファイル名だけを取り出し、実体は public のパスからそのまま配信させる。
 * fs を触るのはビルド時のみで、生成されるのは文字列配列だけ。
 */
export default function talkLogosPlugin(): Plugin {
  let root = process.cwd()

  const listFiles = () => {
    try {
      return readdirSync(resolve(root, DIR))
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
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined
    },
    load(id) {
      if (id !== RESOLVED_ID) return
      return `export const files = ${JSON.stringify(listFiles())}`
    },
    configureServer(server) {
      // 開発中にファイルを足したら選択肢に反映されるよう、仮想モジュールを無効化する
      const invalidate = (file: string) => {
        if (!file.includes(DIR.replace(/\//g, '/'))) return
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID)
        if (mod) server.moduleGraph.invalidateModule(mod)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.add(resolve(root, DIR))
      server.watcher.on('add', invalidate)
      server.watcher.on('unlink', invalidate)
    },
  }
}
