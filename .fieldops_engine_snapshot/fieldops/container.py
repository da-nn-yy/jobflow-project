import os
from fieldops.config import Settings, load_settings
from fieldops.utils.clock import SystemClock
from fieldops.storage.memory import MemoryPlaybookStore, MemoryWorkflowStore, MemoryRunStore
from fieldops.handlers.registry import HandlerRegistry
from fieldops.engine.orchestrator import WorkflowOrchestrator
from fieldops.workers.executor import TaskExecutor
from fieldops.services.playbook_service import PlaybookService
from fieldops.services.workflow_service import WorkflowService
from fieldops.services.execution_service import ExecutionService
from fieldops.catalog.loader import CatalogLoader
from fieldops.events.bus import EventBus
from fieldops.metrics.registry import MetricsRegistry

class Container:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or load_settings(os.environ.get("FIELDOPS_CONFIG"))
        self.clock = SystemClock()
        self.playbook_store = MemoryPlaybookStore()
        self.workflow_store = MemoryWorkflowStore()
        self.run_store = MemoryRunStore()
        self.handlers = HandlerRegistry()
        self.events = EventBus()
        self.metrics = MetricsRegistry()
        self.orchestrator = WorkflowOrchestrator(self.workflow_store, self.clock)
        self.executor = TaskExecutor(self.handlers, self.settings)
        self.playbooks = PlaybookService(self.playbook_store, self.handlers, self.clock)
        self.workflows = WorkflowService(self.playbook_store, self.workflow_store, self.run_store, self.clock)
        self.execution = ExecutionService(self.playbook_store, self.workflow_store, self.run_store, self.orchestrator, self.executor, self.clock)
        self.catalog = CatalogLoader(self.playbook_store)

    async def bootstrap(self) -> None:
        await self.catalog.seed_if_empty()

def create_container(settings: Settings | None = None) -> Container:
    return Container(settings)
