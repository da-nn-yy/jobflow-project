# Operations runbook

## Deploy

Build artifacts with `npm run build`, then container image via `docker build`. Set `JOBFLOW_CONFIG` to the environment JSON file.

## Auth

Production should disable `JOBFLOW_AUTH_DISABLED` and issue API keys per tenant. Keys are bearer tokens; first 8 chars are the lookup prefix.

## Observability

- `GET /health` — liveness
- `GET /metrics` — Prometheus scrape target
- `GET /admin/dead-letter` — failed runs after retry exhaustion
- `GET /admin/audit` — recent audit entries

## Failure handling

Failed tasks retry with exponential backoff. Workflow moves to `failed`; after global retry budget, `dead_letter` transition stores payload for operator replay.
