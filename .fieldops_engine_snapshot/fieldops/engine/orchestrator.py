from fieldops.domain.enums import WorkflowState, TaskStatus
from fieldops.domain.models import WorkflowInstance
from fieldops.engine.state_machine import WorkflowStateMachine
from fieldops.storage.memory import MemoryWorkflowStore
from fieldops.utils.clock import SystemClock

class WorkflowOrchestrator:
    def __init__(self, store: MemoryWorkflowStore, clock: SystemClock | None = None) -> None:
        self._store = store
        self._sm = WorkflowStateMachine()
        self._clock = clock or SystemClock()

    async def apply(self, wf: WorkflowInstance, event: str) -> WorkflowInstance:
        if not self._sm.can_transition(wf.state, event):
            raise ValueError(f"cannot apply {event} from {wf.state}")
        wf.state = self._sm.transition(wf.state, event)
        wf.updated_at = self._clock.now_iso()
        await self._store.save(wf)
        return wf

    async def mark_task(self, wf: WorkflowInstance, task_id: str, status: TaskStatus, output: dict | None = None, error: str | None = None) -> WorkflowInstance:
        for t in wf.tasks:
            if t.definition_task_id == task_id:
                t.status = status
                t.finished_at = self._clock.now_iso() if status in (TaskStatus.SUCCEEDED, TaskStatus.FAILED) else t.finished_at
                if output:
                    t.output = output
                if error:
                    t.error_message = error
        wf.updated_at = self._clock.now_iso()
        await self._store.save(wf)
        return wf
