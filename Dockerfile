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

# Debug build output layout
RUN ls -la /app/.next && ls -la /app/.next/standalone && ls -la /app/.next/standalone/.next/static

# ----------------------------
# 2. Production stage
# ----------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built app
COPY --from=builder /app ./

# Expose Next.js port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]