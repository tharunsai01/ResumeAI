# AI service image. Build from the ai-service folder:  docker build -t hiresmart-ai-service .
# Debian-based on purpose: the embedding runtime (onnxruntime) does not run on Alpine.
FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY scripts/download-model.js ./scripts/download-model.js

# Download the embedding model now, so the container needs no internet for it at start-up.
ENV EMBEDDING_CACHE_DIR=/app/models
RUN node scripts/download-model.js

ENV NODE_ENV=production \
    PORT=8000
EXPOSE 8000

RUN mkdir -p /app/evaluation && chown node:node /app/evaluation
USER node
CMD ["node", "src/server/start.js"]