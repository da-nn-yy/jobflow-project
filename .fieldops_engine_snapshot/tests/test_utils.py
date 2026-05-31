import asyncio
from fieldops.config import load_settings
from fieldops.utils.clock import SystemClock
from fieldops.utils.ids import new_id

def test_settings_defaults():
    s = load_settings(None)
    assert s.port == 4200

def test_clock_iso_format():
    ts = SystemClock().now_iso()
    assert ts.endswith("Z")

def test_new_id_prefix():
    assert new_id("run").startswith("run_")

def test_storage_stores_runs():
    async def run():
        from fieldops.storage.memory import MemoryRunStore
        from fieldops.domain.models import WorkOrderRun
        from fieldops.domain.enums import WorkflowState
        store = MemoryRunStore()
        wo = WorkOrderRun(id="run_1", playbook_id="p", workflow_id="w", status=WorkflowState.PENDING, started_at="t", trigger="x")
        await store.save(wo)
        assert await store.get("run_1") is not None
    asyncio.run(run())
