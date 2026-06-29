import { createRoute } from 'honox/factory'
import WaveLayout from '../../components/layout/WaveLayout'
import Header from '../../components/commonUI/Header'
import Footer from '../../components/layout/Footer'
import ArticleList from '../../islands/ArticleList'
import { aggregateArticles } from '../../lib/aggregate'

export default createRoute(async (c) => {
  const articles = await aggregateArticles({
    qiitaId: 'maguro-alternative',
    zennId: 'maguro_alterna',
    noteId: 'maguro_alter',
    perSource: 50,
  })

  return c.render(
    <WaveLayout>
      <Header />
      <div className="text-white max-w-4/5 mx-auto mb-8">
        <h1 className="text-4xl mb-6">Articles</h1>
        <ArticleList articles={articles} />
      </div>
      <Footer />
    </WaveLayout>,
    {
      title: 'Articles | マグロポートフォリオ',
      description: 'Blog・Qiita・Zenn・note・スライドの記事一覧。',
    }
  )
})
