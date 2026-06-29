// app/islands/TocSpy.tsx （任意）
// スクロール位置に応じて目次の現在地をハイライトする。
// 使う場合は Toc コンポーネントの <nav> を島にするか、
// 記事ページにこの島を1つ置く（DOMを id で監視する）。
import { useEffect } from 'hono/jsx'

export default function TocSpy() {
  useEffect(() => {
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.toc .toc-link')
    )
    if (links.length === 0) return

    const byId = new Map<string, HTMLAnchorElement>()
    for (const a of links) {
      const id = a.getAttribute('href')?.slice(1)
      if (id) byId.set(id, a)
    }

    const headings = Array.from(byId.keys())
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          links.forEach((l) => l.classList.remove('is-active'))
          byId.get(entry.target.id)?.classList.add('is-active')
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    )

    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [])

  return null
}
