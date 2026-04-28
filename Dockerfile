# ----------------------------
# 1. Build stage
# ----------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy project
COPY . .

# Generate Prisma client before building
RUN npm run db:generate

# Build Next.js app
RUN npm run build

# ----------------------------
# 2. Production stage
# ----------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install Playwright dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright

# Copy only the runtime output from the builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./.next/standalone
COPY --from=builder /app/.next/static ./.next/standalone/.next/static

# Install Playwright browsers
RUN npx playwright install chromium

# Expose Next.js port
EXPOSE 3000

# Start Next.js standalone server
CMD ["node", ".next/standalone/server.js"]