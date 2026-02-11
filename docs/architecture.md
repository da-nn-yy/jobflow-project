# Architecture

Jobflow Engine is a multi-tenant workflow orchestration service. HTTP clients register job definitions (DAGs of tasks), start runs, and observe state transitions. Execution is simulated in-process with configurable latency and failure rates suitable for staging.

## Components

| Layer | Responsibility |
|-------|----------------|
| **API** | Fastify routes, auth, rate limits |
| **Services** | Jobs, workflows, schedules, webhooks, audit |
| **Engine** | State machine, transition guards, run locks |
| **Workers** | Task simulation, retries, cron ticker, pool |
| **Storage** | In-memory stores; optional file journal |
| **Metrics** | Prometheus text export |

## Run lifecycle

```
POST /jobs/:id/runs → pending workflow → running → tasks execute → completed | failed | dead_lettered
```

Cron schedules poll every minute and enqueue runs when expressions match.

## Events

Domain events feed metrics counters and webhook dispatch. Audit records capture mutating API actions when enabled per route.
