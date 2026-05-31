# Multi-stage build: compile in-image, max 2 COPY layers (platform limit: 3 destinations).
# Base image must be pinned — do not use ARG in FROM.

FROM node:20.14.0-bookworm-slim AS builder

WORKDIR /app

COPY . /app

RUN npm ci \
  && npm run build \
  && npm prune --omit=dev \
  && rm -rf src tsconfig.json

FROM node:20.14.0-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    JOBFLOW_AUTH_DISABLED=1 \
    JOBFLOW_CONFIG=/app/config/engine.default.json

COPY --from=builder /app /app

EXPOSE 4100

USER node

CMD ["node", "dist/index.js"]
