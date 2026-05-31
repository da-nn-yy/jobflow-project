import asyncio
from httpx import ASGITransport, AsyncClient
from fieldops.api.app import create_app

def test_health_endpoint():
    async def run():
        app = create_app()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            r = await client.get("/health")
            assert r.status_code == 200
            assert r.json()["service"] == "fieldops-engine"
    asyncio.run(run())

def test_list_handlers():
    async def run():
        app = create_app()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            r = await client.get("/handlers")
            assert r.status_code == 200
            assert len(r.json()["handlers"]) == 13
    asyncio.run(run())

def test_playbook_run_flow():
    async def run():
        app = create_app()
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            await client.get("/playbooks")
            r = await client.post("/playbooks/hvac_emergency/runs", json={"input": {"customer_name": "Bob", "trade": "hvac"}})
            assert r.status_code == 201
            run_id = r.json()["run"]["id"]
            ex = await client.post(f"/runs/{run_id}/execute")
            assert ex.status_code == 200
    asyncio.run(run())
