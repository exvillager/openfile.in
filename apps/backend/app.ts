import { Diesel } from 'diesel-core'
import { cors } from 'diesel-core/cors'
import { logger, advancedLogger } from 'diesel-core/logger'
import { httpRequestsCounter, httpResponseTime, registry } from './metrics'
import { diesel_auth_router } from '@/api/routes/auth.routes'
import { diesel_link_router } from '@/api/routes/link.routes'
import { diesel_file_router } from '@/api/routes/file.routes'
import { CONFIG } from '@/config'

export function createApp() {
  const app = new Diesel({})
  app.useLogger(logger)
  //app.useAdvancedLogger(advancedLogger)

  const allowedOrigins = CONFIG.CORS_ORIGINS?.split(',') || []

  app
    // CORS
    .use(cors({ origin: allowedOrigins, credentials: true }))

    // Stamp request start time for metrics
    .addHooks('onRequest', (ctx) => {
      ctx.set('_start', Date.now())
    })

    // Prometheus metrics
    .addHooks('onSend', async (ctx, res) => {
      if (!res) return
      const duration = (Date.now() - (ctx.get<number>('_start') ?? Date.now())) / 1000
      httpRequestsCounter.labels(ctx.req.method, ctx.req.url, res.status.toString()).inc()
      httpResponseTime.labels(ctx.req.method, ctx.req.url, res.status.toString()).observe(duration)
    })

    // Security headers
    .addHooks('onSend', async (_ctx, res) => {
      if (!res) return
      res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
      res.headers.set('X-Frame-Options', 'DENY')
      res.headers.set('Referrer-Policy', 'no-referrer')
      res.headers.set('X-XSS-Protection', '0')
      res.headers.set('X-Content-Type-Options', 'nosniff')
      return res
    })

    // Health & monitoring
    .get('/', () => new Response('Welcome to openfile'))
    .get('/health', (c: any) => c.text("i'm good lady boy!"))
    .get('/metrics', async (c: any) => {
      const metrics = await registry.metrics()
      return c.text(metrics, 200, { 'Content-Type': registry.contentType })
    })

  // API routes
  app.sub('/api/v1/auth/*', diesel_auth_router)
  app.sub('/api/v1/link/*', diesel_link_router)
  app.sub('/api/v1/file/*', diesel_file_router)

  return app
}
