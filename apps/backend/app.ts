import { Diesel } from "diesel-core";
import { cors } from "diesel-core/cors";
import { logger, advancedLogger } from "diesel-core/logger";
import { httpRequestsCounter, httpResponseTime, registry } from "./metrics";
import { diesel_auth_router } from "@/api/routes/auth.routes";
import { diesel_link_router } from "@/api/routes/link.routes";
import { diesel_file_router } from "@/api/routes/file.routes";
import { CONFIG } from "@/config";

// Turns a raw request URL into a low-cardinality, secret-free metric label.
// Drops the query string (upload/validate endpoints carry `?token=...`, which
// must never land in the publicly scrapable /metrics) and collapses dynamic
// path segments (ids, uuids, tokens) so the label set stays bounded.
function metricsPath(rawUrl: string): string {
  let path = rawUrl;
  try {
    path = new URL(rawUrl, "http://local").pathname;
  } catch {
    path = rawUrl.split("?")[0];
  }
  return (
    path
      .split("/")
      .map((seg) => {
        if (!seg) return seg;
        if (/^\d+$/.test(seg)) return ":id";
        if (/^[0-9a-fA-F-]{16,}$/.test(seg)) return ":id";
        if (seg.length > 24) return ":token";
        return seg;
      })
      .join("/") || "/"
  );
}

export function createApp() {
  const app = new Diesel({});
  app.useLogger(logger);
  //app.useAdvancedLogger(advancedLogger)

  const allowedOrigins = CONFIG.CORS_ORIGINS?.split(",") || [];

  app
    // CORS
    .use(cors({ origin: allowedOrigins, credentials: true }))

    // Stamp request start time for metrics
    .addHooks("onRequest", (ctx) => {
      ctx.set("_start", Date.now());
    })

    // Prometheus metrics
    .addHooks("onSend", async (ctx, res) => {
      if (!res) return;
      const duration = (Date.now() - (ctx.get<number>("_start") ?? Date.now())) / 1000;
      const path = metricsPath(ctx.req.url);
      httpRequestsCounter.labels(ctx.req.method, path, res.status.toString()).inc();
      httpResponseTime.labels(ctx.req.method, path, res.status.toString()).observe(duration);
    })

    // Security headers
    .addHooks("onSend", async (_ctx, res) => {
      if (!res) return;
      res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
      res.headers.set("X-Frame-Options", "DENY");
      res.headers.set("Referrer-Policy", "no-referrer");
      res.headers.set("X-XSS-Protection", "0");
      res.headers.set("X-Content-Type-Options", "nosniff");
      return res;
    })

    // Health & monitoring
    .get("/", () => new Response("Welcome to openfile"))
    .get("/health", (c: any) => c.text("i'm good lady boy!"))
    .get("/metrics", async (c: any) => {
      const metrics = await registry.metrics();
      return c.text(metrics, 200, { "Content-Type": registry.contentType });
    });

  // API routes
  app.sub("/api/v1/auth/*", diesel_auth_router);
  app.sub("/api/v1/link/*", diesel_link_router);
  app.sub("/api/v1/file/*", diesel_file_router);

  return app;
}
