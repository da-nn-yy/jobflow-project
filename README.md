# Jobflow Engine

Production-style job processing and workflow orchestration service for platform teams. Registers versioned job definitions (task DAGs), executes runs with stateful transitions, retries, cron triggers, signed webhooks, audit trails, and Prometheus metrics.

## Stack

- Node.js 20+, TypeScript (ESM), Fastify
- In-memory persistence (dev/staging); file journal helpers for snapshots
- Vitest unit tests

## Quick start

```bash
npm install
npm run build
npm test
JOBFLOW_AUTH_DISABLED=1 npm run dev
```

Service listens on port **4100** by default (`config/engine.default.json`).

```bash
curl http://localhost:4100/health
curl http://localhost:4100/metrics
npm run seed
```

## API overview

| Area | Endpoints |
|------|-----------|
| Jobs | `GET/POST /jobs`, `GET /jobs/:id`, `POST /jobs/:id/runs` |
| Runs | `GET /runs/:id`, `POST /runs/:id/execute` |
| Schedules | `GET/POST /schedules` |
| Webhooks | `POST /webhooks` |
| Ops | `GET /metrics`, `GET /admin/dead-letter`, `GET /admin/audit`, `GET /admin/handlers` |

Bearer API keys authenticate tenants when `JOBFLOW_AUTH_DISABLED` is unset.

## Configuration

| Variable | Purpose |
|----------|---------|
| `JOBFLOW_CONFIG` | Path to engine JSON |
| `JOBFLOW_AUTH_DISABLED` | `1` skips API key check (local only) |

## Docker

```bash
npm run build
docker compose up --build
```

## Layout

```
src/domain/       Core models
src/engine/       State machine, locks, compensation
src/workers/      Execution, cron, pool
src/services/     Application services
src/storage/      Memory + file adapters
src/api/          HTTP layer
src/metrics/      Prometheus registry
src/webhooks/     Signed delivery
src/security/     API keys
tests/            Unit tests
config/           Engine + job templates
docs/             Architecture and runbook
```

See [docs/architecture.md](docs/architecture.md) and [docs/runbook.md](docs/runbook.md).
