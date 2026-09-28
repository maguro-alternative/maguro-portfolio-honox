import type { Child } from 'hono/jsx'
import Header from '../commonUI/Header'
import Footer from './Footer'

/**
 * 記事ページ用。他ページの波背景は読書中に視線を奪うので、ここでは使わず不透明な紙面だけにする。
 */
export default function BlogLayout({
  hero,
  children,
}: {
  hero: Child
  children: Child
}) {
  return (
    <div className="blog-paper antialiased min-h-screen">
      <div className="container mx-auto">
        <Header />
      </div>
      <div className="max-w-3xl mx-auto px-4 pt-6 md:pt-10 pb-16">
        <div className="pb-8 mb-8 border-b border-white/10">{hero}</div>
        {children}
      </div>
      <Footer />
    </div>
  )
}
