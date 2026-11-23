# ==========================================
# HireSmart AI - Express Backend Dockerfile
# Multi-stage production build
# ==========================================

FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm for fast, reproducible dependency management
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency specifications
COPY package.json pnpm-lock.yaml* package-lock.json* ./

# Install all dependencies including devDependencies for build
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

# Copy TypeScript configuration and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# ==========================================
# Production Runtime Stage
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN corepack enable && corepack prepare pnpm@latest --activate && \
    if [ -f pnpm-lock.yaml ]; then pnpm install --prod --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci --only=production; \
    else npm install --only=production; fi

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

# Create uploads storage directory
RUN mkdir -p uploads/resumes && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:5000/health || exit 1

CMD ["node", "dist/server.js"]
