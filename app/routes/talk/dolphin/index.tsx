import { createRoute } from 'honox/factory'
import DolphinTalkClient from '../../../islands/DolphinTalkClient'

export default createRoute((c) =>
  c.render(<DolphinTalkClient />, {
    title: 'ドルフィンウェーブ セリフメーカー',
    description:
      '好きな画像を、ドルフィンウェーブの会話画面風に仕上げられるコラージュツールです。',
    ogImage: '/api/og/talk',
  })
)
