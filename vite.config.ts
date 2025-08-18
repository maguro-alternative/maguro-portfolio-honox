import mdx from '@mdx-js/rollup'
import honox from 'honox/vite'
import client from 'honox/vite/client'
import { defineConfig } from 'vite'
import nodeServerPlugin from './vite-node-server-plugin'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      plugins: [client()],
    }
  } else {
    return {
      plugins: [
        honox(),
        nodeServerPlugin(),
        mdx({ jsxImportSource: 'hono/jsx' }),
      ],
    }
  }
})
