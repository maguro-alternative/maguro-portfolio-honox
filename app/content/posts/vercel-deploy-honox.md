---
title: "VercelにHonoXをデプロイする"
publishedAt: "2026-07-26"
description: "ぶっちゃけ誰得要素強いけど置いておく"
---

## はじめに
どうしてもHonoXをVercelで動かしたかったのでメモ程度に

##　やったこと

3行で表すと
- Vercelでビルドせず、Vite側でビルドする
- `dist/assets`を`.vercel/output/static/`にコピーする
- ビルドしたものをVercelに`--prebuilt`でアップロードする

### VercelのHonoビルドは使えない
VercelにはHonoのデプロイ基盤がありますが、HonoXはHono+Viteという組み合わせで構成されています。
ドキュメントを見ると根本としてHonoのプリセットではViteを実行しないので、そのまま使うことはできません。
加えてエントリファイルの置き場所も決まっていて、プロジェクトルートか`src/`配下を探します。
HonoXのエントリは`app/server.ts`なので、ここも噛み合いません。HonoX側が`/app/`をハードコードしているため、規約に合わせて移動することもできません。

https://vercel.com/docs/frameworks/backend/hono

なので、プリセットに頼らずViteでビルドする必要があります。

### じゃあどうするか

とはいえそこまでやることは難しくないです。
(Node.js使うこと想定してます。)

- vite.config.ts
```ts
import build from '@hono/vite-build/vercel'
import adapter from '@hono/vite-dev-server/node'
import honox from 'honox/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: {
          input: ['./app/client.ts', './app/style.css'],
        },
        manifest: true,
      },
    }
  }

  return {
    plugins: [
      honox({
        devServer: { adapter },
      }),
      build(),
    ],
  }
})
```

ビルドする際、クライアント側とサーバー側は分けてやります。

HonoXは`app/islands/`配下のものはクライアントとして扱われ、これをブラウザが扱える形式に変換する必要があります。(cssも同様)
出力されたファイルは`client-qR_IxzNI.js`という風にハッシュが付くため、`manifest`がないと名前解決ができなくなるため有効にします。

サーバー側は特段設定することはありません。
`@hono/vite-build/vercel`を使ってVercel用にbuildを行います。

これでクライアント、サーバーそれぞれに`dist/`,`.vercel/output/`が出力されます。

- package.json
```json
{
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "rm -rf dist .vercel/output && vite build --mode client && vite build && cp -r dist/assets .vercel/output/static/",
    "deploy": "npm run build && vercel deploy --prebuilt --prod"
  },
  "engines": {
    "node": "22.x"
  }
}
```

HonoXではクライアント側のビルドの出力先は`dist/`に固定されてます。

https://github.com/honojs/honox/blob/v0.1.40/src/server/components/script.tsx#L19

しかしVercelの場合、静的ファイルは`.vercel/output/static/`配下に置くことがBuild Output APIで規定されています。

https://vercel.com/docs/build-output-api/primitives#static-files

この2つが噛み合わないので、橋渡しの`cp`が必要になります。

deployでは、すでにビルド済みのファイルをアップロードするだけです。
そのため`--prebuilt`をつけてます。

https://vercel.com/docs/cli/deploy#prebuilt

- vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "buildCommand": "npm run build"
}
```

`framework: null`でフレームワークの自動検出を無効化します。

以上です。
ビルドとデプロイしてみましょう。
```sh
npm run build
npm run deploy
```

DEMO
https://maguro-portfolio-honox.vercel.app/

### 個人的にハマった点
ほぼ蛇足ですが書きます。

- ビルドするNode.jsのバージョンが20/22/24以外だと弾かれる
VercelがサポートしているNode.jsのランタイムは`20.x`/`22.x`/`24.x`の3つです。手元のNode.jsのバージョンが25だったのでデプロイに失敗しました。

```
16:07:34.879 Running build in Washington, D.C., USA (East) – iad1
16:07:34.879 Build machine configuration: 2 cores, 8 GB
16:07:34.912 Retrieving list of deployment files...
16:07:35.231 Downloading 52 deployment files...
16:07:36.412 Using prebuilt build artifacts from .vercel/output
16:07:36.412 Learn more: https://vercel.link/build-output-api
16:07:36.418 Deploying outputs...
16:07:36.810 The following Serverless Functions contain an invalid "runtime":
16:07:36.810   - __hono (nodejs25.x)
```

Nodeのバージョン切り替えるってのも考えましたが、正直動けば良いのでビルド後にruntimeを直接書き換えることにしました。
ここややこしいんですが`@hono/vite-build/vercel`が、ビルドしたマシンのNode.jsバージョンをそのまま`.vc-config.json`に書き込んでいて、そこを見て実行するruntimeを決めているようです。
なのでここのバージョンを書き換えればそのバージョンで動きます。

https://github.com/vercel/vercel/blob/main/packages/build-utils/src/collect-build-result/validate-build-result.ts

と言うわけで`nodejs22.x`で動かすように書き換えます。

- scripts/fix-vercel-runtime.mjs

```js
import { readFileSync, writeFileSync } from 'node:fs'

const path = '.vercel/output/functions/__hono.func/.vc-config.json'
const config = JSON.parse(readFileSync(path, 'utf8'))
config.runtime = 'nodejs22.x'
writeFileSync(path, JSON.stringify(config))
console.log(`runtime: ${config.runtime}`)
```

合わせてpackage.jsonのbuildの部分も書き換えます。
`node scripts/fix-vercel-runtime.mjs`を追加します。

```json
"build":"rm -rf dist .vercel/output && vite build --mode client && vite build && cp -r dist/assets .vercel/output/static/ && node scripts/fix-vercel-runtime.mjs",
```

中身がNode.js22で動くことが前提となりますが、デプロイは通るようになります。

## 終わりに
色々コード読みながら進めてみましたが、謎解きみたいで楽しいですね。
間違いあればご報告いただけるとありがたいです。
