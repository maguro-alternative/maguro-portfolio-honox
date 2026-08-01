import { createRoute } from 'honox/factory'
import SnowContainer from '../../islands/SnowContainer'

// 背景は動画で配信する（gif 版は 77MB あり Cloudflare の静的アセット上限 25MiB を超えるため）
const backgrounds = [
  { video: '/yumimahou.mp4', poster: '/yumimahou-poster.jpg' },
  //{ video: "/yumikasane.mp4", poster: "/yumikasane-poster.jpg" },
]

export default createRoute((c) => {
  const randomIndex = Math.floor(Math.random() * backgrounds.length)
  const selectedBackground = backgrounds[randomIndex]

  return c.render(
    <div className="relative h-screen overflow-hidden">
      {/* autoplay が遅延・ブロックされても poster が出るようにしておく */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={selectedBackground.video}
        poster={selectedBackground.poster}
        autoplay
        loop
        muted
        playsinline
        preload="auto"
      />
      <div className="relative h-full">
        <SnowContainer />
      </div>
    </div>,
    {
      title: 'Uchu-emon',
      description: "Uchu-emon's portfolio site",
    }
  )
})
