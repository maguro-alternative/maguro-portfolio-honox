import { createRoute } from 'honox/factory'
import SnowContainer from '../../islands/SnowContainer'

const backgroundImages = [
  '/yumimahou.gif',
  //"/yumikasane.gif",
]

export default createRoute((c) => {
  const randomIndex = Math.floor(Math.random() * backgroundImages.length)
  const selectedBackground = backgroundImages[randomIndex]

  return c.render(
    <div
      className="h-screen overflow-hidden bg-cover"
      style={{ backgroundImage: `url('${selectedBackground}')` }}
    >
      <SnowContainer />
    </div>,
    {
      title: 'Uchu-emon',
      description: "Uchu-emon's portfolio site",
    }
  )
})
