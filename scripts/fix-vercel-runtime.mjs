// @hono/vite-build/vercel はビルド環境の Node バージョンを runtime に書き込むため、
// Vercel がサポートするバージョン（package.json の engines と一致）に揃える
import { readFileSync, writeFileSync } from 'node:fs'

const path = '.vercel/output/functions/__hono.func/.vc-config.json'
const config = JSON.parse(readFileSync(path, 'utf8'))
config.runtime = 'nodejs22.x'
writeFileSync(path, JSON.stringify(config))
console.log(`runtime: ${config.runtime}`)
