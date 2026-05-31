import os
from fastapi import FastAPI, HTTPException, Request
from fieldops.container import create_container
from fieldops.domain.models import PlaybookDefinition
from fieldops.middleware.request_id import new_request_id
from fieldops.openapi.spec import service_info
from fieldops.reporting.dashboard import build_summary
from fieldops.dispatch.territory import TERRITORIES

_container = None

async def _get_container():
    global _container
    if _container is None:
        _container = create_container()
        await _container.bootstrap()
    return _container

def create_app() -> FastAPI:
    info = service_info()
    app = FastAPI(title=info["title"], version=info["version"], description=info["description"])

    @app.middleware("http")
    async def attach_request_id(request: Request, call_next):
        request.state.request_id = new_request_id()
        response = await call_next(request)
        response.headers["X-Request-Id"] = request.state.request_id
        return response

    @app.get("/health")
    async def health():
        return {"status": "ok", "service": "fieldops-engine"}

    @app.get("/metrics")
    async def metrics():
        c = await _get_container()
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(c.metrics.render())

    @app.get("/territories")
    async def territories():
        return {"territories": TERRITORIES}

    @app.get("/analytics/summary")
    async def analytics_summary():
        c = await _get_container()
        runs = await c.run_store.list_all()
        completed = failed = 0
        for run in runs:
            try:
                wf = await c.workflows.get_workflow_by_run(run.id)
            except Exception:
                continue
            if wf.state.value == "completed":
                completed += 1
            elif wf.state.value == "failed":
                failed += 1
        return build_summary(len(runs), completed, failed)

    @app.get("/playbooks")
    async def list_playbooks():
        c = await _get_container()
        pbs = await c.playbooks.list()
        return {"playbooks": [{"id": p.id, "name": p.name, "version": p.version} for p in pbs]}

    @app.post("/playbooks", status_code=201)
    async def register_playbook(body: PlaybookDefinition):
        c = await _get_container()
        return await c.playbooks.register(body)

    @app.get("/playbooks/{playbook_id}")
    async def get_playbook(playbook_id: str):
        c = await _get_container()
        try:
            return await c.playbooks.get(playbook_id)
        except Exception as e:
            raise HTTPException(404, str(e)) from e

    @app.post("/playbooks/{playbook_id}/runs", status_code=201)
    async def start_run(playbook_id: str, body: dict | None = None):
        c = await _get_container()
        payload = body or {}
        run, wf, _ = await c.workflows.create_run(playbook_id, payload.get("trigger", "api"), payload.get("input", {}))
        c.metrics.inc("runs_started")
        return {"run": run.model_dump(), "workflow": wf.model_dump()}

    @app.get("/runs/{run_id}")
    async def get_run(run_id: str):
        c = await _get_container()
        try:
            return (await c.workflows.get_workflow_by_run(run_id)).model_dump()
        except Exception as e:
            raise HTTPException(404, str(e)) from e

    @app.post("/runs/{run_id}/execute")
    async def execute_run(run_id: str):
        c = await _get_container()
        await c.execution.execute_run(run_id)
        c.metrics.inc("runs_executed")
        return (await c.workflows.get_workflow_by_run(run_id)).model_dump()

    @app.get("/handlers")
    async def list_handlers():
        c = await _get_container()
        return {"handlers": c.handlers.list_names()}

    return app
