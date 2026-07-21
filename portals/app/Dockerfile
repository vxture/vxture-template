# syntax=docker/dockerfile:1.7
# Multi-stage build for the Next.js standalone app in a pnpm workspace.
# Build context = repo root (so the workspace and lockfile are visible).
# Produces the single owned image <code>-app.

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable

# --- deps + build ---
FROM base AS builder
WORKDIR /repo
COPY . .
# The GitHub Packages token (for @vxture/*) rides a BuildKit secret, read via
# .npmrc's ${NODE_AUTH_TOKEN} - never a build-arg, never baked into a layer. The
# secret is optional: the scaffold has no @vxture/* dep yet, so a build without
# it still resolves the public registry.
ARG VXTURE_NPM_REGISTRY
RUN --mount=type=secret,id=node_auth_token \
    --mount=type=cache,id=pnpm,target=/pnpm/store \
    NODE_AUTH_TOKEN="$(cat /run/secrets/node_auth_token 2>/dev/null || true)" \
    pnpm install --frozen-lockfile
ARG NEXT_PUBLIC_GIT_SHA=unknown
ENV NEXT_PUBLIC_GIT_SHA=$NEXT_PUBLIC_GIT_SHA
RUN pnpm --filter @product-code/app build

# --- runner (Next standalone, non-root, never migrates) ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder /repo/portals/app/.next/standalone ./
COPY --from=builder /repo/portals/app/.next/static ./portals/app/.next/static
COPY --from=builder /repo/portals/app/public ./portals/app/public
USER nextjs
EXPOSE 3000
CMD ["node", "portals/app/server.js"]
