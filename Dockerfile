FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# --- Dependensi lengkap untuk build ------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- Dependensi produksi saja untuk runtime ----------------------------------
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Build --------------------------------------------------------------------
FROM base AS builder
# NEXT_PUBLIC_* ditanam ke bundle saat build: mengubahnya berarti build ulang.
# Sumber nilainya, berurutan: build arg dari compose (PUBLIC_API_BASE_URL di
# .env root) bila diisi, lalu .env aplikasi ini, lalu bawaan kode
# (http://localhost:8000). Ini alamat API yang dipanggil PERAMBAN.
ARG NEXT_PUBLIC_API_BASE_URL=
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN [ -n "$NEXT_PUBLIC_API_BASE_URL" ] || unset NEXT_PUBLIC_API_BASE_URL; \
    npm run build

# --- Runtime ------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/package.json /app/next.config.ts ./
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]
