// 軽量な frontmatter パーサ。content/*.md の単純な key: value 形式に対応する。
// gray-matter を使わずバンドルを軽量に保ち、どのランタイムでも動作させる。
export function parseFrontmatter(raw: string): {
  data: Record<string, string>
  content: string
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return { data: {}, content: raw }

  const data: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = /^\s*([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line)
    if (!m) continue
    let value = m[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    data[m[1]] = value
  }

  return { data, content: raw.slice(match[0].length) }
}

export function slugFromPath(path: string): string {
  return path.split('/').pop()!.replace(/\.mdx?$/, '')
}
