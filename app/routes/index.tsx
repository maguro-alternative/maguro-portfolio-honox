import { createRoute } from 'honox/factory'
import WaveLayout from '../components/layout/WaveLayout'
import Header from '../components/commonUI/Header'
import Footer from '../components/layout/Footer'
import Uchuemon from '../components/icon/uchuemon'
import ArticlesSection from '../components/features/ArticlesSection'
import { aggregateArticles } from '../lib/aggregate'

export default createRoute(async (c) => {
  const articles = await aggregateArticles({
    qiitaId: 'maguro-alternative',
    zennId: 'maguro_alterna',
    noteId: 'maguro_alter',
  })

  return c.render(
    <WaveLayout>
      <Header />
      <div className="text-white max-w-4/5 mx-auto">
        <div className="flex md:flex-row justify-center items-center mb-5">
          <div className="md:w-1/2">
            <h1 className="text-4xl">
              ようこそ！！！
              <br />
              マグロポートフォリオ用トップページへ！！！
            </h1>
            <p>マグロのポートフォリオサイトです。</p>
            <p>とりあえず合ったほうがいいだろのテンションで作ってます。</p>
          </div>
          <div className="flex justify-center items-center mb-5 md:w-1/2">
            <Uchuemon />
          </div>
        </div>
      </div>
      <ArticlesSection articles={articles.slice(0, 9)} />
      <Footer />
    </WaveLayout>,
    { title: 'マグロポートフォリオ' }
  )
})
