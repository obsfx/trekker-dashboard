FROM oven/bun:1.3.9 AS bun

FROM mcr.microsoft.com/playwright:v1.63.0-noble

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build:client

ENV CI=1
CMD ["bun", "run", "test:e2e"]
