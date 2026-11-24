# ==========================================
# HireSmart AI - Express Backend Dockerfile
# Multi-stage production build
# ==========================================

FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# ==========================================
# Production Runtime Stage
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist
COPY docs ./docs

# Create uploads storage directory
RUN mkdir -p uploads/resumes && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:5000/health || exit 1

CMD ["node", "dist/server.js"]
