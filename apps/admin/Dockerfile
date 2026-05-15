# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy root config files
COPY package.json package-lock.json ./
COPY turbo.json ./

# Copy package configurations
COPY apps/admin/package.json ./apps/admin/
COPY packages/ui/package.json ./packages/ui/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the Admin portal
RUN npx turbo run build --filter=@repo/admin

# Production stage
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Next.js standalone build is more efficient for Docker
COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

EXPOSE 3001

# Next.js standalone entry point
CMD ["node", "apps/admin/server.js"]
