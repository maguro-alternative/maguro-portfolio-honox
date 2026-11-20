// Workers Builds のデプロイコマンド。Workers Builds には本番確認とロールバックがないので、
// wrangler deploy の後に本番を確認し、だめなら直前の版へ戻してビルドを失敗させる
import { execFileSync } from 'node:child_process'

const BASE = 'https://maguro-alternative.com'
const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit' })

const status = execFileSync('npx', ['wrangler', 'deployments', 'status', '--json'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
})
const previous = JSON.parse(status).versions[0].version_id
console.log(`現在の版: ${previous}`)

run('npx', ['wrangler', 'deploy'])

try {
  run('node', ['scripts/smoke.mjs', BASE, 'dist/.vite/manifest.json'])
} catch (_error) {
  console.error(`本番確認に失敗したので ${previous} に戻す`)
  const sha = process.env.WORKERS_CI_COMMIT_SHA ?? 'unknown'
  run('npx', ['wrangler', 'rollback', previous, '-y', '-m', `smoke test failed: ${sha}`])
  run('node', ['scripts/smoke.mjs', BASE])
  process.exit(1)
}
