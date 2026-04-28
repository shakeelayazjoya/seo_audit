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

# Build Next.js app
RUN npm run build


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