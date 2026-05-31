import asyncio
from fieldops.container import create_container
from fieldops.domain.models import PlaybookDefinition, TaskDefinition
from fieldops.domain.enums import WorkflowState

def test_create_run_and_execute_hvac():
    async def run():
        c = create_container()
        await c.bootstrap()
        pb = await c.playbooks.get("hvac_emergency")
        wo, wf, _ = await c.workflows.create_run(pb.id, "test", {"customer_name": "Jane", "phone": "+15551212"})
        await c.execution.execute_run(wo.id)
        final = await c.workflows.get_workflow_by_run(wo.id)
        assert final.state in (WorkflowState.COMPLETED, WorkflowState.FAILED, WorkflowState.RUNNING)
        succeeded = sum(1 for t in final.tasks if t.status.value == "succeeded")
        assert succeeded >= 1
    asyncio.run(run())

def test_register_custom_playbook():
    async def run():
        c = create_container()
        pb = PlaybookDefinition(
            id="custom_smoke",
            name="Custom",
            tasks=[TaskDefinition(id="only", name="Only", handler="workorder.intake", timeout_ms=5000)],
        )
        await c.playbooks.register(pb)
        got = await c.playbooks.get("custom_smoke")
        assert got.name == "Custom"
    asyncio.run(run())

def test_catalog_seeds_playbooks():
    async def run():
        c = create_container()
        await c.bootstrap()
        pbs = await c.playbooks.list()
        assert len(pbs) >= 42
    asyncio.run(run())
