# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root config files
COPY package.json package-lock.json ./
COPY turbo.json ./

# Copy package configurations
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies (ignoring scripts initially to avoid local package issues)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npm run db:generate -w @repo/database

# Build the API
RUN npx turbo run build --filter=@repo/api

# Production stage
FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "apps/api/dist/main"]
