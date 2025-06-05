import { jsxRenderer } from 'hono/jsx-renderer'
import { Script } from 'honox/server'

export default jsxRenderer(({ children }) => {
  return (
    <html>
      <head>
        <link
          href={import.meta.env.PROD ? `/assets/style.css` : `/app/style.css`}
          rel="stylesheet"
        />
        <Script src="/app/client.ts" async />
      </head>
      <body>{children}</body>
    </html>
  )
})
