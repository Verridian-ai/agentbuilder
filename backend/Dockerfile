# Agent Builder Backend - Production Dockerfile
# Optimized for Google Cloud Run deployment

FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Production image
FROM node:20-slim

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV REGION=australia-southeast1

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start with dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
