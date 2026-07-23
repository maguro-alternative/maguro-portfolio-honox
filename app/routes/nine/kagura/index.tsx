import { createRoute } from 'honox/factory'
import KaguraClient from '../../../islands/KaguraClient'

export default createRoute((c) => {
  const cParam = c.req.query('c')
  let ogImage: string
  if (cParam) {
    ogImage = `/api/og/kagura?c=${cParam}`
  } else {
    const sp = new URLSearchParams()
    let has = false
    for (let i = 1; i <= 9; i++) {
      const slug = c.req.query(`s${i}`)
      if (slug) {
        sp.set(`s${i}`, slug)
        has = true
      }
    }
    ogImage = has
      ? `/api/og/kagura?${sp.toString()}`
      : '/api/og/kagura?title=私を構成する9人のシノビ少女'
  }

  return c.render(<KaguraClient />, {
    title: '私を構成する9人のシノビ少女',
    description: '9人の閃乱カグラのキャラクターを選んで画像として保存',
    ogImage,
  })
})
