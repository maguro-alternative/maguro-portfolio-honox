import { createRoute } from 'honox/factory'
import WaveLayout from '../../components/layout/WaveLayout'
import Header from '../../components/commonUI/Header'
import Footer from '../../components/layout/Footer'
import Uchuemon from '../../components/icon/uchuemon'
import Twitter from '../../components/socials/twitter'
import Github from '../../components/socials/github'
import Zenn from '../../components/socials/zenn'
import Qiita from '../../components/socials/qiita'

export default createRoute((c) => {
  return c.render(
    <WaveLayout>
      <Header />

      <div className="text-white max-w-4/5 mx-auto">
        <h1 className="text-4xl mb-5">自己紹介</h1>

        <div className="bg-white/10 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-4/12 flex justify-center">
              <Uchuemon />
            </div>
            <div className="md:w-8/12">
              <h2 className="text-2xl mb-2 bg-transparent border-none text-white p-0">名前: マグロ</h2>
              <h2 className="text-2xl mb-2 bg-transparent border-none text-white p-0">本名: 佐々木陽貴</h2>
              <h2 className="text-2xl mb-4 bg-transparent border-none text-white p-0">
                所属: 日本大学工学部 情報工学科 学部4年 → 株式会社くふうカンパニー
              </h2>

              <h3 className="text-xl mb-2">リンク集</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <Twitter id="sigumataityouda" />
                <a
                  href="https://www.instagram.com/gi_se_so/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white"
                    alt="Instagram"
                  />
                </a>
                <Github id="maguro-alternative" />
              </div>

              <h3 className="text-xl mb-2">Zenn</h3>
              <Zenn id="maguro_alterna" />

              <h3 className="text-xl mb-2 mt-4">Qiita</h3>
              <Qiita id="maguro-alternative" />

              <h3 className="text-xl mb-2 mt-4">Wantedly</h3>
              <div className="flex gap-2 mb-4">
                <a
                  href="https://www.wantedly.com/id/haruki_sasaki_ad"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src="https://www.wantedly.com/favicon.ico" width="50" height="50" alt="Wantedly" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-2xl mb-4 bg-transparent border-none text-white p-0">Skill</h2>

          <h3 className="text-xl mb-2">Lang</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <img src="https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue" alt="Python" />
            <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="JavaScript" />
            <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
            <img src="https://img.shields.io/badge/go-%2300ADD8.svg?style=for-the-badge&logo=go&logoColor=white" alt="Go" />
            <img src="https://img.shields.io/badge/php-%23777BB4.svg?style=for-the-badge&logo=php&logoColor=white" alt="PHP" />
          </div>

          <h3 className="text-xl mb-2">Tool</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
            <img src="https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white" alt="Git" />
            <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
          </div>

          <h3 className="text-xl mb-2">Framework</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
            <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
            <img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React" />
            <img src="https://img.shields.io/badge/fastapi-109989?style=for-the-badge&logo=FASTAPI&logoColor=white" alt="FastAPI" />
            <img src="https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel" />
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-2xl mb-4 bg-transparent border-none text-white p-0">Use Games</h2>
          <div className="flex flex-wrap gap-2">
            <img src="https://img.shields.io/badge/Nintendo_Switch-E60012?style=for-the-badge&logo=nintendo-switch&logoColor=white" alt="Nintendo Switch" />
            <img src="https://img.shields.io/badge/Nintendo_3DS-D12228?style=for-the-badge&logo=nintendo-3ds&logoColor=white" alt="Nintendo 3DS" />
            <img src="https://img.shields.io/badge/Steam-000000?style=for-the-badge&logo=steam&logoColor=white" alt="Steam" />
            <img src="https://img.shields.io/badge/Epic%20Games-313131?style=for-the-badge&logo=Epic%20Games&logoColor=white" alt="Epic Games" />
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-2xl mb-4 bg-transparent border-none text-white p-0">制作物</h2>

          <div className="mb-6">
            <h3 className="text-xl mb-2">Discordの多機能Bot</h3>
            <a href="https://github.com/maguro-alternative/discordfast" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-100">
              GitHub: discordfast
            </a>
          </div>

          <div>
            <h3 className="text-xl mb-2">Joy-Conを使用した骨伝導演奏</h3>
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                width="560"
                height="315"
                src="https://www.youtube.com/embed/vM_LJggO4IY"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </WaveLayout>,
    {
      title: '自己紹介 | マグロポートフォリオ',
      description: 'マグロの自己紹介・スキル・制作物。',
    }
  )
})
