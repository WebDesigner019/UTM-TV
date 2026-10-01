# Build ARG dipisah supaya bisa di-cache ulang tanpa mengulang npm ci.
FROM node:20-alpine AS base
# openssl dipakai Prisma Engine, libc6-compat dibutuhkan binary native Prisma
# di Alpine.
RUN apk add --no-cache libc6-compat openssl

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma generate dulu karena build Next mengimpor Prisma Client.
RUN npx prisma generate \
 && npm run build

# Image final memakai output "standalone" dari next.config.mjs: hanya server
# Next dan dependensi yang benar-benar terpakai, tanpa devDependencies.
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs \
 && adduser -u 1001 -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma Client yang sudah di-generate tidak selalu ikut tertelusur oleh
# Next, jadi disalin eksplisit. Tanpa ini aplikasi gagal saat query pertama.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
# Disalin hanya supaya `npx prisma migrate deploy` bisa dijalankan di dalam
# container, bukan supaya aplikasi membacanya saat runtime.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
# Volume upload sudah dibuat Docker dari image ini, jadi kepemilikannya ikut
# nextjs dan aplikasi tidak perlu berjalan sebagai root.
RUN mkdir -p uploads \
 && chown -R nextjs:nodejs uploads
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]

# Tahap terpisah untuk migrasi. Sengaja tidak memakai image runner karena
# Prisma CLI tidak ada di sana; image ini berisi devDependencies yang memang
# dibutuhkan CLI. Dijalankan sekali lewat `docker compose run --rm migrate`.
FROM base AS migrate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
CMD ["npx", "prisma", "migrate", "deploy"]
