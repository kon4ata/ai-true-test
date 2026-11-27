# ---------- deps: полные зависимости (с dev) для сборки ----------
FROM node:26-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- build: компиляция Nest ----------
FROM node:26-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- prod-deps: только production-зависимости ----------
FROM node:26-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---------- runtime ----------
FROM node:26-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/src/db/schema ./src/db/schema
COPY --from=build /app/tsconfig.json ./tsconfig.json
COPY --from=build /app/src ./src

EXPOSE 3000

CMD ["sh", "-c", "node dist/db/migrate.js && npm run db:seed && node dist/main.js"]