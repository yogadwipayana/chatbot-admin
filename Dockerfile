FROM node:22-alpine AS base
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
# Ini alamat API yang dipanggil PERAMBAN, bukan alamat antar-container.
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

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
