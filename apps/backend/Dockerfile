FROM oven/bun:latest AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN bun install --frozen-lockfile

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

RUN bun run build

FROM oven/bun:latest AS deps

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN bun install --frozen-lockfile --production

FROM node:24-slim AS runner

WORKDIR /app/apps/backend

COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/backend/node_modules ./node_modules
COPY --from=build /app/apps/backend/dist ./dist
COPY apps/backend/package.json ./package.json

EXPOSE 8000

CMD ["node", "dist/index.js"]
