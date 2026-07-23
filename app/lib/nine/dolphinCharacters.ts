export interface DolphinCharacter {
  name: string;
  reading: string;
  team: string;
  slug: string;
  imageUrl: string;
}

export const dolphinCharacters: DolphinCharacter[] = [
  // KIRISHIMA
  { name: '咲宮 入華', reading: 'さきみや いるか', team: 'KIRISHIMA', slug: 'iruka-sakimiya', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/iruka-sakimiya/ogp.png' },
  { name: '都条 みちる', reading: 'とじょう みちる', team: 'KIRISHIMA', slug: 'michiru-tojo', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/michiru-tojo/ogp.png' },
  { name: '陽南 杏里', reading: 'はるなみ あんり', team: 'KIRISHIMA', slug: 'anri-harunami', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/anri-harunami/ogp.png' },
  { name: '彩戸 詩絵', reading: 'あやと うたえ', team: 'KIRISHIMA', slug: 'utae-ayato', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/utae-ayato/ogp.png' },
  { name: '咲宮 小針', reading: 'さきみや こはり', team: 'KIRISHIMA', slug: 'kohari-sakimiya', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/kohari-sakimiya/ogp.png' },

  // KAZAMI TECH
  { name: '相馬 颯', reading: 'そうま はやて', team: 'KAZAMI TECH', slug: 'hayate-souma', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/hayate-souma/ogp.png' },
  { name: '風見 エレン', reading: 'かざみ えれん', team: 'KAZAMI TECH', slug: 'ellen-kazami', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/ellen-kazami/ogp.png' },
  { name: '永雪 氷織', reading: 'なゆき ひおり', team: 'KAZAMI TECH', slug: 'hiori-nayuki', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/hiori-nayuki/ogp.png' },
  { name: 'シュネー・ヴァイスベルグ', reading: 'しゅねー ゔぁいすべるぐ', team: 'KAZAMI TECH', slug: 'schnee-weissberg', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/schnee-weissberg/ogp.png' },
  { name: '長土 萌依', reading: 'ながと めい', team: 'KAZAMI TECH', slug: 'mei-nagato', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/mei-nagato/ogp.png' },

  // 日向重工
  { name: '黒瀬 見波', reading: 'くろせ みなみ', team: '日向重工', slug: 'minami-kurose', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/minami-kurose/ogp.png' },
  { name: '伊澄 桐利', reading: 'いずみ きり', team: '日向重工', slug: 'kiri-izumi', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/kiri-izumi/ogp.png' },
  { name: '刃兼 乙姫', reading: 'はがね おつき', team: '日向重工', slug: 'otsuki-hagane', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/otsuki-hagane/ogp.png' },
  { name: '暮無 夕離', reading: 'くれなし ゆり', team: '日向重工', slug: 'yuri-kurenashi', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/yuri-kurenashi/ogp.png' },

  // NereIdes
  { name: '住乃絵 紫苑', reading: 'すみのえ しおん', team: 'NereIdes', slug: 'shion-suminoe', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/shion-suminoe/ogp.png' },
  { name: 'ヘリー・ルイス', reading: 'へりー るいす', team: 'NereIdes', slug: 'helly-lewis', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/helly-lewis/ogp.png' },
  { name: 'ヴィーナ', reading: 'ゔぃーな', team: 'NereIdes', slug: 'veena', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/veena/ogp.png' },
  { name: 'セレナ・ルイス', reading: 'せれな るいす', team: 'NereIdes', slug: 'selena-lewis', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/selena-lewis/ogp.png' },

  // 浦見製鉄所
  { name: '山葉 由芽', reading: 'やまば ゆめ', team: '浦見製鉄所', slug: 'yume-yamaba', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/yume-yamaba/ogp.png' },
  { name: '浦見 かな', reading: 'うらみ かな', team: '浦見製鉄所', slug: 'kana-urami', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/kana-urami/ogp.png' },

  // FMワダツミ
  { name: '村早 麻汐', reading: 'むらはや ましお', team: 'FMワダツミ', slug: 'mashio-murahaya', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/mashio-murahaya/ogp.png' },
  { name: '久々利 トモ', reading: 'くくり とも', team: 'FMワダツミ', slug: 'tomo-kukuri', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/tomo-kukuri/ogp.png' },

  // ISRW
  { name: 'アイネス', reading: 'あいねす', team: 'ISRW', slug: 'eines', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/eines/ogp.png' },
  { name: 'ナハト', reading: 'なはと', team: 'ISRW', slug: 'nacht', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/nacht/ogp.png' },
  { name: '咲良・アンソニー', reading: 'さら あんそにー', team: 'ISRW', slug: 'sarah-anthony', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/sarah-anthony/ogp.png' },
  { name: 'アマディア・ヴォルファ', reading: 'あまでぃあ ゔぉるふぁ', team: 'ISRW', slug: 'amadea-wolfa', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/amadea-wolfa/ogp.png' },

  // GRIMO→GOETIA
  { name: '紙枝 つぐみ', reading: 'かみえ つぐみ', team: 'GRIMO→GOETIA', slug: 'tsugumi-kamie', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/tsugumi-kamie/ogp.png' },
  { name: '羽仁原 はる', reading: 'はにはら はる', team: 'GRIMO→GOETIA', slug: 'haru-hanihara', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/haru-hanihara/ogp.png' },
  { name: 'ユノ', reading: 'ゆの', team: 'GRIMO→GOETIA', slug: 'yuno', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/yuno/ogp.png' },
  { name: '玄口 むうる', reading: 'くろくち むうる', team: 'GRIMO→GOETIA', slug: 'muru-kurokuchi', imageUrl: 'https://hpgames.jp/dolphin-wave/assets/img/chara/muru-kurokuchi/ogp.png' },
];
