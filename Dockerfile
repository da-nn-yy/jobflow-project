# syntax=docker/dockerfile:1
# Multi-stage build: compiles TypeScript in-image (no host dist/ required).
# Override base image when needed: docker build --build-arg NODE_IMAGE=node:22-bookworm-slim .

ARG NODE_IMAGE=node:20-bookworm-slim

FROM ${NODE_IMAGE} AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM ${NODE_IMAGE} AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    JOBFLOW_AUTH_DISABLED=1 \
    JOBFLOW_CONFIG=/app/config/engine.default.json

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY config ./config

EXPOSE 4100

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4100/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
