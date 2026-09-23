import { copyFileSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

const VIRTUAL_ID = 'virtual:resvg-wasm'
const RESOLVED_ID = '\0' + VIRTUAL_ID
const WASM_FILE_NAME = 'resvg.wasm'

/**
 * resvg の wasm を initWasm に渡せる形で仮想モジュールから配る。
 *
 * Cloudflare Workers は実行時の WebAssembly.compile を禁じているので、
 * wasm は dist/ に出したうえで static import のまま残し、wrangler にモジュールとして解決させる。
 * それ以外（dev の node / Vercel）はコンパイルできるので、バイト列を埋め込んで渡す。
 */
export default function resvgWasmPlugin(): Plugin {
  const wasmPath = createRequire(import.meta.url).resolve(
    '@resvg/resvg-wasm/index_bg.wasm'
  )
  const isCloudflare = process.env.DEPLOY_TARGET === 'cloudflare'
  let outDir = 'dist'

  return {
    name: 'resvg-wasm',

    configResolved(config) {
      outDir = config.build.outDir
    },

    resolveId(id, importer) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      // バンドルせず、wrangler に wasm モジュールとして解決させる
      if (id === `./${WASM_FILE_NAME}` && importer === RESOLVED_ID) {
        return { id, external: 'relative' }
      }
    },

    load(id) {
      if (id !== RESOLVED_ID) return
      if (isCloudflare) {
        return `import wasm from './${WASM_FILE_NAME}'\nexport default wasm`
      }
      const base64 = readFileSync(wasmPath).toString('base64')
      return `export default Uint8Array.from(atob(${JSON.stringify(
        base64
      )}), (c) => c.charCodeAt(0))`
    },

    writeBundle() {
      // SSR ビルドは emitFile した asset を書き出さないので、自分で置く
      if (isCloudflare) copyFileSync(wasmPath, resolve(outDir, WASM_FILE_NAME))
    },
  }
}
