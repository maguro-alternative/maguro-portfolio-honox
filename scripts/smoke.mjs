// デプロイ後の本番確認。node scripts/smoke.mjs <base-url> [manifest]
// manifest を渡すと、HTML がそのビルドの client を参照するまで待つ。
// デプロイ直後に古い版が応答して確認をすり抜けるのを防ぐため。
import { readFileSync } from 'node:fs'

const [base, manifestPath] = process.argv.slice(2)
if (!base) {
  console.error('usage: node scripts/smoke.mjs <base-url> [manifest]')
  process.exit(2)
}

const ROUTES = [
  ['/', 'text/html'],
  ['/blog/hello-world', 'text/html'],
  ['/slides', 'text/html'],
  ['/slides/sample', 'text/html'],
  ['/articles', 'text/html'],
  ['/profile', 'text/html'],
  ['/talk/dolphin', 'text/html'],
  ['/talk/shinomas', 'text/html'],
  ['/nine/dolphin', 'text/html'],
  ['/nine/kagura', 'text/html'],
  ['/gacha/dolphin', 'text/html'],
  ['/snow', 'text/html'],
  ['/yumi', 'text/html'],
  ['/sitemap.xml', 'application/xml'],
  ['/robots.txt', 'text/plain'],
  ['/api/og/blog?slug=hello-world', 'image/png'],
  ['/api/og/slides?slug=sample', 'image/png'],
  ['/api/og/dolphin', 'image/png'],
  ['/api/og/kagura', 'image/png'],
  ['/api/og/talk', 'image/png'],
  ['/api/og/shinomas-talk', 'image/png'],
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForBuild(expected) {
  for (let i = 0; i < 30; i++) {
    const html = await fetch(base + '/', { cache: 'no-store' }).then((r) => r.text()).catch(() => '')
    if (html.includes(expected)) return
    await sleep(5000)
  }
  throw new Error(`本番が ${expected} を参照しない（新しい版に切り替わっていない）`)
}

// 1回の通信エラーで NG にすると、壊れていない版までロールバックしてしまう
async function check(path, type) {
  let last = ''
  for (let i = 0; i < 3; i++) {
    if (i > 0) await sleep(2000)
    try {
      const res = await fetch(base + path, { redirect: 'manual' })
      const actual = res.headers.get('content-type') ?? ''
      if (res.status === 200 && actual.startsWith(type)) return null
      last = `${res.status} ${actual}`
    } catch (error) {
      last = String(error)
    }
  }
  return `${path}: ${last}（期待値 200 ${type}）`
}

if (manifestPath) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const entry = Object.values(manifest).find((v) => v.isEntry && v.file.endsWith('.js'))
  await waitForBuild(`/${entry.file}`)
  console.log(`build: /${entry.file}`)
}

const html = await fetch(base + '/').then((r) => r.text()).catch(() => '')
const assets = [...new Set(html.match(/\/assets\/[^"]+\.(?:js|css)/g) ?? [])]
const targets = [
  ...ROUTES,
  ...assets.map((a) => [a, a.endsWith('.js') ? 'text/javascript' : 'text/css']),
]

const failures = (await Promise.all(targets.map(([p, t]) => check(p, t)))).filter(Boolean)
for (const f of failures) console.error(`NG ${f}`)
console.log(`${targets.length - failures.length}/${targets.length} OK`)
process.exit(failures.length ? 1 : 0)
