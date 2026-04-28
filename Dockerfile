# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone build output and public assets
COPY --from=builder /app/.next/standalone .
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
