# ---------- deps ----------
FROM node:26-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- builder ----------
FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- runner ----------
FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# standalone-сервер
COPY --from=builder /app/.next/standalone ./
# статика (Next её НЕ копирует в standalone автоматически)
COPY --from=builder /app/.next/static ./.next/static
# публичные файлы (если есть)
COPY --from=builder /app/public ./public

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]