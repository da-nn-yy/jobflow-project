from fieldops.domain.models import PlaybookDefinition, WorkflowInstance, WorkOrderRun, TaskRun
from fieldops.domain.enums import WorkflowState, TaskStatus
from fieldops.domain.errors import NotFoundError
from fieldops.storage.memory import MemoryPlaybookStore, MemoryWorkflowStore, MemoryRunStore
from fieldops.utils.clock import SystemClock
from fieldops.utils.ids import new_id

class WorkflowService:
    def __init__(self, playbooks: MemoryPlaybookStore, workflows: MemoryWorkflowStore, runs: MemoryRunStore, clock: SystemClock) -> None:
        self._playbooks = playbooks
        self._workflows = workflows
        self._runs = runs
        self._clock = clock

    async def create_run(self, playbook_id: str, trigger: str, input: dict | None = None) -> tuple[WorkOrderRun, WorkflowInstance, PlaybookDefinition]:
        pb = await self._playbooks.get(playbook_id)
        if not pb:
            raise NotFoundError("Playbook", playbook_id)
        run_id = new_id("run")
        wf_id = new_id("wf")
        now = self._clock.now_iso()
        tasks = [
            TaskRun(id=new_id("task"), run_id=run_id, definition_task_id=t.id, handler=t.handler)
            for t in pb.tasks
        ]
        wf = WorkflowInstance(id=wf_id, playbook_id=playbook_id, run_id=run_id, state=WorkflowState.PENDING, context=dict(input or {}), tasks=tasks, created_at=now, updated_at=now)
        run = WorkOrderRun(id=run_id, playbook_id=playbook_id, workflow_id=wf_id, status=WorkflowState.PENDING, started_at=now, trigger=trigger, input=dict(input or {}))
        await self._workflows.save(wf)
        await self._runs.save(run)
        return run, wf, pb

    async def get_workflow_by_run(self, run_id: str) -> WorkflowInstance:
        wf = await self._workflows.get_by_run(run_id)
        if not wf:
            raise NotFoundError("Workflow", run_id)
        return wf
