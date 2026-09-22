FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN bun install --frozen-lockfile

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

RUN bun run compile
RUN bun build ./scripts/migrate.ts --compile --outfile migrate

FROM oven/bun:latest AS runner

WORKDIR /app

COPY --from=builder /app/apps/backend/app-server ./
COPY --from=builder /app/apps/backend/migrate ./
COPY --from=builder /app/apps/backend/drizzle ./drizzle

EXPOSE 8000

# Apply pending migrations, then start the server. If a migration fails the
# container exits instead of serving traffic against the wrong schema.
ENTRYPOINT ["sh", "-c", "./migrate && exec ./app-server"]
