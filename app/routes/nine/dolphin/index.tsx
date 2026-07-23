import { createRoute } from 'honox/factory'
import DolphinClient from '../../../islands/DolphinClient'

export default createRoute((c) => {
  const sp = new URLSearchParams()
  let has = false
  for (let i = 1; i <= 9; i++) {
    const slug = c.req.query(`s${i}`)
    if (slug) {
      sp.set(`s${i}`, slug)
      has = true
    }
  }
  const ogImage = has
    ? `/api/og/dolphin?${sp.toString()}`
    : '/api/og/dolphin?title=私を構成する9人のドルフィン'

  return c.render(<DolphinClient />, {
    title: '私を構成する9人のドルフィン',
    description: '9人のドルフィンウェーブのキャラクターを選んで画像として保存',
    ogImage,
  })
})
