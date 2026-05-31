# Jobflow Engine

Internal job processing and workflow orchestration service. Manages job definitions, stateful workflow instances, simulated async task execution, retries, and in-memory persistence for development and integration tests.

## Stack

- Node.js 20+
- TypeScript (ESM)
- Fastify HTTP API
- Vitest

## Run

```bash
npm install
npm run dev          # HTTP API on port 4100
npm test
npm run seed         # register sample job definitions
```

Configuration: `config/engine.default.json` or `JOBFLOW_CONFIG` env var.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness |
| GET | `/jobs` | List job definitions |
| POST | `/jobs` | Register job definition |
| GET | `/jobs/:jobId` | Fetch definition |
| POST | `/jobs/:jobId/runs` | Start run (async execution) |
| GET | `/runs/:runId` | Workflow instance state |
| POST | `/runs/:runId/execute` | Drive execution manually |

## Layout

```
src/domain/       Entities, events, retry policy
src/engine/       State machine, guards, orchestrator
src/workers/      Task simulation, scheduler, retries
src/services/     Job, workflow, execution, rules
src/storage/      In-memory stores
src/validators/   Definition and transition validation
src/api/          HTTP routes and server
tests/            Unit tests
config/           Engine and transition rules JSON
scripts/          Seed and worker helpers
```
