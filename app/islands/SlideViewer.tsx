import { useCallback, useEffect, useRef, useState } from 'hono/jsx'

const SLIDE_BASE_WIDTH = 960
const SLIDE_BASE_HEIGHT = 540
const MOBILE_BREAKPOINT = 768

type Props = {
  title: string
  slidesHtml: string[]
}

export default function SlideViewer({ title, slidesHtml }: Props) {
  const totalSlides = slidesHtml.length
  const [current, setCurrent] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scale, setScale] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const goNext = useCallback(() => {
    setCurrent((prev) => Math.min(prev + 1, totalSlides - 1))
  }, [totalSlides])

  const goPrev = useCallback(() => {
    setCurrent((prev) => Math.max(prev - 1, 0))
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'f') {
        toggleFullscreen()
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    window.addEventListener('keydown', handleKey)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [goNext, goPrev, toggleFullscreen])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const update = () => {
      const rect = container.getBoundingClientRect()
      const mobile = rect.width < MOBILE_BREAKPOINT
      setIsMobile(mobile)

      if (!mobile) {
        const scaleX = rect.width / SLIDE_BASE_WIDTH
        const scaleY = rect.height / SLIDE_BASE_HEIGHT
        setScale(Math.min(scaleX, scaleY))
      }
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const slides = (
    <>
      {slidesHtml.map((html, i) => (
        <div
          key={i}
          className={`slide-item${i === current ? ' active' : ''}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}
    </>
  )

  return (
    <div className="h-dvh bg-gray-950 flex flex-col overflow-hidden">
      <header className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3 bg-gray-900 border-b border-gray-800 text-white">
        <a
          href="/slides"
          className="text-sm text-gray-400 hover:text-white transition-colors shrink-0"
        >
          ← 一覧
        </a>
        <h1 className="text-sm font-medium truncate mx-4">{title}</h1>
        <button
          onClick={toggleFullscreen}
          className="text-sm text-gray-400 hover:text-white transition-colors bg-transparent border-gray-700 px-3 py-1 shrink-0"
        >
          {isFullscreen ? '解除' : '全画面'}
        </button>
      </header>

      <div
        ref={containerRef}
        className="flex-1 min-h-0 flex items-center justify-center bg-gray-950 overflow-hidden"
      >
        {isMobile ? (
          <div className="slide-content w-full h-full bg-gray-900 text-white">
            <div className="w-full h-full px-6 py-8 flex items-center">
              <div className="w-full">{slides}</div>
            </div>
          </div>
        ) : (
          <div
            className="slide-content bg-gray-900 text-white overflow-hidden"
            style={{
              width: SLIDE_BASE_WIDTH,
              height: SLIDE_BASE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            <div className="w-full h-full p-16 flex items-center">
              <div className="w-full">{slides}</div>
            </div>
          </div>
        )}
      </div>

      <footer className="shrink-0 flex items-center justify-center gap-4 px-6 py-3 bg-gray-900 border-t border-gray-800">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors border-gray-700"
        >
          ←
        </button>
        <span className="text-gray-400 text-sm tabular-nums min-w-[80px] text-center">
          {current + 1} / {totalSlides}
        </span>
        <button
          onClick={goNext}
          disabled={current === totalSlides - 1}
          className="text-white bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors border-gray-700"
        >
          →
        </button>
      </footer>
    </div>
  )
}
