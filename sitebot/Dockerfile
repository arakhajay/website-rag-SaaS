# syntax=docker/dockerfile:1

# Build stage
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Next.js standalone build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runtime stage
FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN useradd --create-home --shell /usr/sbin/nologin appuser

# Copy standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output#automatically-copying-traced-files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER appuser
EXPOSE 3000

# Next standalone output includes server.js at the root
CMD ["node", "server.js"]
