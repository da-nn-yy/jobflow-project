import asyncio
import pytest
from fieldops.handlers.registry import HandlerRegistry
from fieldops.handlers.base import HandlerContext

@pytest.mark.parametrize("name", [
    "workorder.intake", "workorder.triage", "dispatch.assign_technician",
    "parts.reserve", "field.execute_visit", "billing.generate_invoice",
])
def test_handlers_execute(name: str):
    async def run():
        reg = HandlerRegistry()
        h = reg.get(name)
        assert h is not None
        ctx = HandlerContext(run_id="run_test", task_id="t1", input={"customer_name": "Acme", "site_id": "S1"})
        result = await h.execute(ctx)
        assert result.success, result.error
    asyncio.run(run())

def test_intake_requires_customer():
    async def run():
        h = HandlerRegistry().get("workorder.intake")
        r = await h.execute(HandlerContext(run_id="r1", task_id="t", input={}))
        assert not r.success
    asyncio.run(run())

def test_registry_lists_all_handlers():
    names = HandlerRegistry().list_names()
    assert len(names) == 13
