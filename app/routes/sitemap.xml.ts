import { createRoute } from 'honox/factory'
import { getBlogSlugs } from '../lib/blog'
import { getSlideSlugs } from '../lib/slides'

const BASE_URL = 'https://maguro-alternative.com'

export default createRoute((c) => {
  const staticPaths = ['/', '/profile', '/articles', '/slides']
  const blogPaths = getBlogSlugs().map((slug) => `/blog/${slug}`)
  const slidePaths = getSlideSlugs().map((slug) => `/slides/${slug}`)
  const lastmod = new Date().toISOString()

  const urls = [...staticPaths, ...blogPaths, ...slidePaths]
    .map(
      (path) =>
        `  <url>\n    <loc>${BASE_URL}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

  return c.body(xml, 200, { 'Content-Type': 'application/xml' })
})
