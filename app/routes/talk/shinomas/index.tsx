import { createRoute } from 'honox/factory'
import ShinomasTalkClient from '../../../islands/ShinomasTalkClient'

export default createRoute((c) =>
  c.render(<ShinomasTalkClient />, {
    title: 'シノマス セリフメーカー',
    description:
      '好きな画像を、シノビマスター 閃乱カグラ NEW LINK の会話画面風に仕上げられるコラージュツールです。',
    ogImage: '/api/og/shinomas-talk',
  })
)
