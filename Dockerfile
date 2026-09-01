# Requires `output: 'standalone'` in next.config.ts.
# Based on https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:22-alpine AS base

# ─────────────────────────────────────────────────────────────
# Dependencies
# ─────────────────────────────────────────────────────────────
FROM base AS deps
# libc6-compat: some native deps need it on Alpine.
# https://github.com/nodejs/docker-node/tree/main#nodealpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* .npmrc* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile


# ─────────────────────────────────────────────────────────────
# Build
# ─────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# `NEXT_PUBLIC_*` is inlined at build time, not read at runtime — so passing it
# only through `environment:` in Compose would leave it undefined in everything
# prerendered. `metadataBase` needs it to build absolute Open Graph URLs, and
# prerendered pages need it too, so it has to be here.
ARG NEXT_PUBLIC_SERVER_URL=""
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL

# The DATABASE_URL below points nowhere on purpose, and nothing may actually
# connect to it: there is no database reachable from a build container. Keeping
# that true is a constraint on the app, not just on this file — a page with
# `generateStaticParams` gets prerendered here, and if rendering it queries
# Payload the build dies with ECONNREFUSED.
#
# Payload throws if `secret` is empty while the config is evaluated during the
# build. These are throwaway placeholders scoped to this RUN only — they are not
# persisted as image env, and the real values are read from the environment at
# runtime.
RUN export PAYLOAD_SECRET=build-time-placeholder \
      DATABASE_URL=postgres://build:build@127.0.0.1:5432/build; \
    corepack enable pnpm && pnpm run build


# ─────────────────────────────────────────────────────────────
# Migrator
# ─────────────────────────────────────────────────────────────
# One-shot stage that runs `payload migrate` before the app starts. It reuses
# the builder because the Payload CLI needs the TypeScript sources and the full
# node_modules, neither of which exist in the standalone output.
FROM builder AS migrator
ENV NODE_ENV=production
ENV PAYLOAD_SECRET=""
ENV DATABASE_URL=""
CMD ["sh", "-c", "corepack enable pnpm && pnpm payload migrate"]


# ─────────────────────────────────────────────────────────────
# Runtime
# ─────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Correct permissions for the prerender cache and the uploads dir
RUN mkdir .next media && chown nextjs:nodejs .next media

# Leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# server.js is created by next build from the standalone output
CMD ["node", "server.js"]
