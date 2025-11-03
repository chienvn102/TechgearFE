# ============================================
# FRONTEND DOCKERFILE - NEXT.JS 15
# ============================================
# Multi-stage build for optimized production image
# Stage 1: Dependencies installation
# Stage 2: Build application
# Stage 3: Production runtime
# ============================================

# ============================================
# STAGE 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

# Install libc6-compat for compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production --legacy-peer-deps && \
    npm cache clean --force

# ============================================
# STAGE 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Create .env.local for build time (will be overridden at runtime)
# These are placeholder values, real values come from docker-compose environment
RUN echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1" > .env.local && \
    echo "NEXT_PUBLIC_BASE_URL=http://localhost:3000" >> .env.local && \
    echo "NEXT_PUBLIC_ENV=production" >> .env.local

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build

# ============================================
# STAGE 3: Production Runtime
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port 5000 (matching package.json start script)
EXPOSE 5000

# Set environment variables that can be overridden
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start Next.js server
CMD ["node", "server.js"]
