import {} from 'hono'

type Head = {
  title?: string
  description?: string
  ogImage?: string
  ogType?: string
}

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, head?: Head): Response | Promise<Response>
  }
}
