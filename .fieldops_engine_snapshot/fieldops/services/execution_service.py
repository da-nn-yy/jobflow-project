from fieldops.domain.enums import WorkflowState, TaskStatus
from fieldops.domain.models import PlaybookDefinition
from fieldops.domain.errors import NotFoundError
from fieldops.storage.memory import MemoryPlaybookStore, MemoryWorkflowStore, MemoryRunStore
from fieldops.engine.orchestrator import WorkflowOrchestrator
from fieldops.workers.executor import TaskExecutor
from fieldops.utils.clock import SystemClock

class ExecutionService:
    def __init__(self, playbooks: MemoryPlaybookStore, workflows: MemoryWorkflowStore, runs: MemoryRunStore, orchestrator: WorkflowOrchestrator, executor: TaskExecutor, clock: SystemClock) -> None:
        self._playbooks = playbooks
        self._workflows = workflows
        self._runs = runs
        self._orchestrator = orchestrator
        self._executor = executor
        self._clock = clock

    async def execute_run(self, run_id: str) -> None:
        wf = await self._workflows.get_by_run(run_id)
        if not wf:
            raise NotFoundError("Workflow", run_id)
        run = await self._runs.get(run_id)
        pb = await self._playbooks.get(wf.playbook_id)
        if not run or not pb:
            raise NotFoundError("Run", run_id)
        wf = await self._orchestrator.apply(wf, "start")
        run.status = wf.state
        await self._runs.save(run)
        prior: dict[str, dict] = {}
        by_def = {t.definition_task_id: t for t in wf.tasks}
        for task_def in pb.tasks:
            if task_def.depends_on:
                deps_ok = all(by_def[d].status == TaskStatus.SUCCEEDED for d in task_def.depends_on if d in by_def)
                if not deps_ok:
                    continue
            tr = by_def[task_def.id]
            tr.attempt += 1
            tr.status = TaskStatus.RUNNING
            tr.started_at = self._clock.now_iso()
            tr = await self._executor.run(tr, task_def, wf.context, prior)
            wf = await self._orchestrator.mark_task(wf, task_def.id, tr.status, tr.output, tr.error_message)
            if tr.status == TaskStatus.SUCCEEDED:
                prior[task_def.id] = tr.output
            elif not task_def.optional:
                wf = await self._orchestrator.apply(wf, "fail")
                run.status = wf.state
                run.finished_at = self._clock.now_iso()
                await self._runs.save(run)
                return
        wf = await self._orchestrator.apply(wf, "complete")
        run.status = wf.state
        run.finished_at = self._clock.now_iso()
        await self._runs.save(run)
