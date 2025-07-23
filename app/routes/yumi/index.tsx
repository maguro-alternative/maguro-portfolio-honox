import { createRoute } from "honox/factory";
import SnowContainer from "../../islands/SnowContainer";

const backgroundImages = [
  "https://pbs.twimg.com/media/GepMxoBbsAMKsH3?format=jpg&name=large",
  "https://www.h1g.jp/shinomas/?plugin=ref&page=%E3%80%90SSR%E3%80%91%E9%9B%AA%E6%B3%89%28%E6%9C%88%E9%96%83%E5%BF%8D%E8%A3%85%E6%9D%9F%29&src=%E3%80%90SSR%E3%80%91%E9%9B%AA%E6%B3%89%28%E6%9C%88%E9%96%83%E5%BF%8D%E8%A3%85%E6%9D%9F%29.jpg",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhthIp0EqBIvHYyvpe0m6Yd1WsuoBWk4t-vQ3rbGkz1FR0cjWCU49-A54k-bLLl4lYiT-uATOlGoBLVyNZw0i3UvLK4-xZHlapFrXQCEvPvwFN2xK6vBPmHr1trEH_xUx1Pbs6dF0Y2e5s_bDTe5EUUW8_Q1s5ItMaGAB9_W_9dWEBCPn_56HGYeKWa5VU/s1920/%E3%83%96%E3%83%AD%E3%82%B0%E7%94%A8%E2%91%A3.png",
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjjCwQx6xB-PrtT_yEiziIkfumxA1I7S37WNOfnl16InYDxKVzsgGt8qSi9QC38wCbGO0VxQZ_R5cdsE6mJWInbT0yzdIsUgC-ZILm0PRCK903J-BlnQ4X6A10szPf6YTW5TqEwEeROnhJloeKtxgrTWEF92YIFZb6KbW5vHqHrTGAFjNsgYmwMBbaOs_I/s1920/cmn_cl62010006.png"
];

export default createRoute(async (c) => {
  // ランダムな背景画像を選択
  const randomIndex = Math.floor(Math.random() * backgroundImages.length);
  const selectedBackground = backgroundImages[randomIndex];

  return c.render(
    <div
      className="h-screen overflow-hidden bg-cover"
      style={{ backgroundImage: `url('${selectedBackground}')` }}
    >
      <div className="flex position-fixed w-full h-full relative snow-container">
          <div className="snow small"><span>❄</span></div>
          <div className="snow medium"><span>❄</span></div>
          <div className="snow large"><span>❄</span></div>
      </div>
      <SnowContainer />
    </div>
  )
});
