# Operations runbook

## Deploy

Build the image directly (TypeScript compiles inside Docker; no local `dist/` required):

```bash
docker build -t jobflow-engine .
docker compose up --build
```

Set `JOBFLOW_CONFIG` to the environment JSON file. Override the Node base image if needed:

```bash
docker build --build-arg NODE_IMAGE=node:22-bookworm-slim -t jobflow-engine .
```

## Auth

Production should disable `JOBFLOW_AUTH_DISABLED` and issue API keys per tenant. Keys are bearer tokens; first 8 chars are the lookup prefix.

## Observability

- `GET /health` — liveness
- `GET /metrics` — Prometheus scrape target
- `GET /admin/dead-letter` — failed runs after retry exhaustion
- `GET /admin/audit` — recent audit entries

## Failure handling

Failed tasks retry with exponential backoff. Workflow moves to `failed`; after global retry budget, `dead_letter` transition stores payload for operator replay.
