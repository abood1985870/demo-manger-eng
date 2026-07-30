FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prisma:generate:prod
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/node_modules ./node_modules

ENV DOCUMENT_STORAGE_PATH=/data/legal-documents
RUN mkdir -p /data/legal-documents \
  && chown -R nextjs:nodejs /data/legal-documents

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["sh", "-c", "node scripts/prepare-postgresql-schema.cjs && ./node_modules/.bin/prisma migrate deploy --schema=prisma/postgresql/schema.prisma && node server.js"]
