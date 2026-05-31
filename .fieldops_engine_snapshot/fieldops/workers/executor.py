import asyncio
import random
from fieldops.domain.enums import TaskStatus
from fieldops.domain.models import TaskDefinition, TaskRun
from fieldops.handlers.registry import HandlerRegistry
from fieldops.handlers.base import HandlerContext
from fieldops.config import Settings

class TaskExecutor:
    def __init__(self, handlers: HandlerRegistry, settings: Settings) -> None:
        self._handlers = handlers
        self._settings = settings

    async def run(self, task_run: TaskRun, definition: TaskDefinition, wf_input: dict, prior: dict[str, dict]) -> TaskRun:
        handler = self._handlers.get(definition.handler)
        if not handler:
            task_run.status = TaskStatus.FAILED
            task_run.error_message = f"no handler {definition.handler}"
            return task_run
        lo, hi = self._settings.simulate_latency_ms.min, self._settings.simulate_latency_ms.max
        await asyncio.sleep(random.uniform(lo, hi) / 1000.0)
        if random.random() * 100 < self._settings.fail_rate_percent:
            task_run.status = TaskStatus.FAILED
            task_run.error_message = "simulated failure"
            return task_run
        ctx = HandlerContext(run_id=task_run.run_id, task_id=task_run.definition_task_id, input=wf_input, prior_outputs=prior)
        result = await handler.execute(ctx)
        if result.success:
            task_run.status = TaskStatus.SUCCEEDED
            task_run.output = result.output
        else:
            task_run.status = TaskStatus.FAILED
            task_run.error_message = result.error or "failed"
        return task_run
