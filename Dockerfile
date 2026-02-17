FROM node:20.14.0-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production \
    JOBFLOW_AUTH_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY dist ./dist
COPY config ./config

EXPOSE 4100
USER node

CMD ["node", "dist/index.js"]
