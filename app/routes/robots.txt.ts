import { createRoute } from 'honox/factory'

const body = `User-agent: *
Allow: /

Sitemap: https://maguro-alternative.com/sitemap.xml
`

export default createRoute((c) => {
  return c.text(body, 200, { 'Content-Type': 'text/plain' })
})
