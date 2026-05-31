from fieldops.domain.models import PlaybookDefinition, WorkOrderRun, WorkflowInstance
from fieldops.domain.enums import WorkflowState

class MemoryPlaybookStore:
    def __init__(self) -> None:
        self._items: dict[str, PlaybookDefinition] = {}

    async def save(self, pb: PlaybookDefinition) -> None:
        self._items[pb.id] = pb

    async def get(self, pid: str) -> PlaybookDefinition | None:
        return self._items.get(pid)

    async def list(self) -> list[PlaybookDefinition]:
        return list(self._items.values())

class MemoryWorkflowStore:
    def __init__(self) -> None:
        self._by_run: dict[str, WorkflowInstance] = {}

    async def save(self, wf: WorkflowInstance) -> None:
        self._by_run[wf.run_id] = wf

    async def get_by_run(self, run_id: str) -> WorkflowInstance | None:
        return self._by_run.get(run_id)

class MemoryRunStore:
    def __init__(self) -> None:
        self._runs: dict[str, WorkOrderRun] = {}

    async def save(self, run: WorkOrderRun) -> None:
        self._runs[run.id] = run

    async def get(self, run_id: str) -> WorkOrderRun | None:
        return self._runs.get(run_id)

    async def list_all(self) -> list[WorkOrderRun]:
        return list(self._runs.values())

    async def list_active(self) -> list[WorkOrderRun]:
        active = {WorkflowState.PENDING, WorkflowState.RUNNING, WorkflowState.WAITING}
        return [r for r in self._runs.values() if r.status in active]
