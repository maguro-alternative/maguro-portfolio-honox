import { useState } from 'hono/jsx'
import { Gacha, GetRandomNumber } from '../lib/gacha/logic'
import { GetConfig } from '../lib/gacha/config'

type Result = { rarity: string; name: string; iconType: number }

const RARITY_ICON: Record<string, string> = {
  ピックアップUR: '/gacha/dolphin/gacha_rare_ur_pickup.png',
  UR: '/gacha/dolphin/gacha_rare_ur.png',
  SSR: '/gacha/dolphin/gacha_rare_ssr.png',
  SR: '/gacha/dolphin/gacha_rare_sr.png',
}

const ICON_TYPE: Record<number, string> = {
  1: '/gacha/dolphin/icon_wave.png',
  2: '/gacha/dolphin/icon_sun.png',
  3: '/gacha/dolphin/icon_gear.png',
  4: '/gacha/dolphin/icon_moon.png',
  5: '/gacha/dolphin/icon_wind.png',
}

export default function GachaDolphin() {
  const [results, setResults] = useState<Result[]>([])
  const [count, setCount] = useState(0)
  const config = GetConfig()

  const handleGacha = (n: number) => {
    setCount((prev) => prev + n)
    const newResults: Result[] = []
    for (let i = 0; i < n; i++) {
      const rescue = i === 9
      const result = Gacha(config, rescue, GetRandomNumber())
      newResults.push(result)
    }
    setResults(newResults)
  }

  return (
    <div className="gacha-page m-auto my-0">
      <div className="tab_wrap">
        <ul className="tab">
          <li className="tab_item"></li>
        </ul>
      </div>
      <div className="cacha_contents_wrapper">
        <div className="rare_box">
          <h3>
            <p className="kind">10連ガチャ</p>
          </h3>
        </div>
        <p>ガチャを引いた回数: {count}</p>
        <button onClick={() => handleGacha(1)}>1回ガチャを引く</button>
        <button onClick={() => handleGacha(10)}>10連ガチャを引く</button>
        <h2>ガチャ結果</h2>
        <ul>
          {results.map((result, i) => (
            <li key={i}>
              <div className="icon-wrapper">
                {RARITY_ICON[result.rarity] ? (
                  <img src={RARITY_ICON[result.rarity]} alt={result.rarity} />
                ) : null}
              </div>
              <div className="icon-wrapper">
                {ICON_TYPE[result.iconType] ? (
                  <img src={ICON_TYPE[result.iconType]} alt="" />
                ) : null}
              </div>
              <div>{result.name}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
