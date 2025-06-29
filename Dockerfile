# HR Recruitment System - Docker Configuration
# Multi-stage build for development and production

# Base stage with Bun runtime
FROM oven/bun:1.2.2-alpine AS base
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    sqlite \
    curl \
    && rm -rf /var/cache/apk/*

# Development stage
FROM base AS development

# Create necessary directories
RUN mkdir -p uploads data

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Note: Dependencies will be installed at container startup to match mounted package.json
# This ensures node_modules always matches the current package.json
CMD ["sh", "-c", "echo '📦 Installing dependencies...' && bun install --frozen-lockfile && echo '🚀 Starting development server...' && bun run dev"]

# Production dependencies stage
FROM base AS deps-production

# Copy package files
COPY package.json bun.lockb* ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Production build stage
FROM base AS build

# Copy package files
COPY package.json bun.lockb* ./

# Install all dependencies for building
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM base AS production

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies
COPY --from=deps-production /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts

# Create uploads directory and set permissions
RUN mkdir -p uploads && \
    chown -R bun:bun /app && \
    chmod -R 755 /app

# Switch to non-root user
USER bun

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start production server
CMD ["bun", "run", "start"]