import type { Child } from 'hono/jsx'
import SpotlightAndWave from '../../islands/SpotLightAndWave'

export default function WaveLayout({ children }: { children: Child }) {
  return (
    <div className="antialiased container mx-auto">
      <SpotlightAndWave />
      {children}
    </div>
  )
}
