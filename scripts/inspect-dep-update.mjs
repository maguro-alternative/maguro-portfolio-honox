// 依存更新 PR の lockfile を base と比べ、機械的に分かる危険信号を JSON で出す。
// node scripts/inspect-dep-update.mjs <base-lock> <head-lock>
// Claude のレビューより先に、だまされようのない判定を出しておくため。
// ここで出た flags は Claude の判断で覆さない（README などに仕込まれた指示で承認させられるため）。
import { readFileSync } from 'node:fs'

const FRESH_MS = 24 * 60 * 60 * 1000

const [basePath, headPath] = process.argv.slice(2)
const load = (path) => JSON.parse(readFileSync(path, 'utf8')).packages ?? {}
const base = load(basePath)
const head = load(headPath)

// npm の別名（"x-updated": "npm:x@..."）は pkg.name に本当の名前が入る
const nameOf = (key, pkg) =>
  pkg?.name ?? key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length)
const baseVersions = new Set(
  Object.entries(base)
    .filter(([key]) => key)
    .map(([key, v]) => `${nameOf(key, v)}@${v.version}`)
)
// lockfile 内の置き場所（キー）が変わっただけのものを、新しく付いたと誤判定しないよう名前で見る
const baseInstallScripts = new Set(
  Object.entries(base)
    .filter(([key, v]) => key && v.hasInstallScript)
    .map(([key, v]) => nameOf(key, v))
)

const changed = []
const added = []
const newInstallScripts = []
for (const [key, pkg] of Object.entries(head)) {
  if (!key || pkg.link) continue
  const name = nameOf(key, pkg)
  const before = base[key]
  if (before?.version === pkg.version) continue
  if (before) changed.push({ name, from: before.version, to: pkg.version })
  else if (!baseVersions.has(`${name}@${pkg.version}`)) added.push({ name, version: pkg.version })
  if (pkg.hasInstallScript && !baseInstallScripts.has(name)) {
    newInstallScripts.push({ name, version: pkg.version })
  }
}

async function publishedAt(name, version) {
  const res = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2F')}`)
  if (!res.ok) return null
  const meta = await res.json()
  return meta.time?.[version] ?? null
}

const targets = [
  ...changed.map((c) => ({ name: c.name, version: c.to })),
  ...added.map((a) => ({ name: a.name, version: a.version })),
]
const unique = [...new Map(targets.map((t) => [`${t.name}@${t.version}`, t])).values()]
const fresh = []
const unknown = []
for (const t of unique) {
  const time = await publishedAt(t.name, t.version).catch(() => null)
  if (!time) unknown.push(t)
  else if (Date.now() - Date.parse(time) < FRESH_MS) fresh.push({ ...t, published: time })
}

// 間接依存が増えるのは正当な更新でもよくあるので flags には入れず、Claude に確認させる
const flags = [
  ...newInstallScripts.map((p) => `install script を持つようになった: ${p.name}@${p.version}`),
  ...fresh.map((p) => `公開から24時間以内: ${p.name}@${p.version}（${p.published}）`),
  ...unknown.map((p) => `公開日時を確認できない: ${p.name}@${p.version}`),
]

console.log(JSON.stringify({ changed, added, newInstallScripts, fresh, flags }, null, 2))
