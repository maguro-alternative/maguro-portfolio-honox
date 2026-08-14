/** ドルフィンウェーブ系ページ共通の、波付きフッター。 */
export default function WaveFooter() {
  return (
    <div className="w-full">
      <div className="relative -mb-1 h-24 overflow-hidden -z-10 pointer-events-none">
        <svg className="pointer-events-none absolute bottom-0 h-full w-[200%] animate-wave-slow" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,100 C90,70 270,70 360,100 C450,130 630,130 720,100 C810,70 990,70 1080,100 C1170,130 1350,130 1440,100 L1440,120 L0,120 Z" fill="rgba(59,130,246,0.5)" />
        </svg>
        <svg className="pointer-events-none absolute bottom-0 h-full w-[200%] animate-wave-mid" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,90 C90,60 270,60 360,90 C450,120 630,120 720,90 C810,60 990,60 1080,90 C1170,120 1350,120 1440,90 L1440,120 L0,120 Z" fill="rgba(96,165,250,0.3)" />
        </svg>
        <svg className="pointer-events-none absolute bottom-0 h-full w-[200%] animate-wave-fast" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,80 C90,50 270,50 360,80 C450,110 630,110 720,80 C810,50 990,50 1080,80 C1170,110 1350,110 1440,80 L1440,120 L0,120 Z" fill="white" />
        </svg>
      </div>
      <div className="flex flex-col items-center justify-center gap-1 bg-blue-500 py-3 relative z-10 pointer-events-auto select-text">
        <p className="pointer-events-auto text-center text-sm text-white">
          &copy; 2025 Maguro Alternative. All rights reserved.
        </p>
        <p className="pointer-events-auto text-center text-sm text-white">
          作者のTwitter:{' '}
          <a href="https://twitter.com/sigumataityouda" className="text-blue-300 hover:text-blue-100" target="_blank" rel="noopener noreferrer">
            @sigumataityouda
          </a>
          ,{' '}
          <a href="https://twitter.com/maguro_alterich" className="text-blue-300 hover:text-blue-100" target="_blank" rel="noopener noreferrer">
            @maguro_alterich
          </a>
        </p>
        <p className="pointer-events-auto text-center text-sm text-white">
          画像：&copy;Marvelous Inc. &copy;HONEY PARADE GAMES Inc.
        </p>
      </div>
    </div>
  )
}
