# FieldOps Engine

**FieldOps Engine** is a Python field-service operations platform for orchestrating work orders — from customer intake and technician dispatch through parts logistics, on-site execution, billing, and customer notifications.

This is a **separate project** from Jobflow Engine (TypeScript). It targets HVAC, plumbing, and facilities maintenance workflows.

## Domain

- **Playbooks** — reusable multi-step work order templates (42+ built-in)
- **Handlers** — `workorder.*`, `dispatch.*`, `parts.*`, `field.*`, `billing.*`, `notify.*`
- **Runs** — live workflow instances with task state tracking

## Quick start

```bash
cd fieldops-engine
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -e ".[dev]"
pytest --cov=fieldops --cov-report=term-missing
uvicorn fieldops.api.app:create_app --factory --port 4200
```

## API (port 4200)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness |
| GET | `/playbooks` | List playbooks |
| POST | `/playbooks/{id}/runs` | Start work order |
| POST | `/runs/{id}/execute` | Drive execution |
| GET | `/handlers` | List task handlers |

## Docker

```bash
docker build -t fieldops-engine .
docker run -p 4200:4200 fieldops-engine
```

## Stack

- Python 3.11+, FastAPI, Pydantic v2, PyYAML
- pytest + coverage (55%+ threshold)
