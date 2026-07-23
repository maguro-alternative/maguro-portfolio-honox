import { createRoute } from 'honox/factory'
import GachaDolphin from '../../../islands/GachaDolphin'

export default createRoute((c) => {
  return c.render(<GachaDolphin />, {
    title: 'ガチャシミュレーター',
    description: "Uchu-emon's portfolio site",
  })
})
