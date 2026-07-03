FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# ===== Dependencies =====
FROM base AS deps
WORKDIR /app
# Root manifest + lockfile + workspace manifests (npm workspaces)
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages
# Install only the api workspace (and its deps) deterministically
RUN npm ci --workspace @pizi/api --include-workspace-root

# ===== Build =====
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate -w @pizi/api && npm run build -w @pizi/api

# ===== Runner =====
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./package.json

EXPOSE 4000
CMD ["node", "dist/main.js"]
