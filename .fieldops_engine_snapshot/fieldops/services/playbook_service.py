from fieldops.domain.models import PlaybookDefinition
from fieldops.domain.errors import NotFoundError, ValidationError
from fieldops.storage.memory import MemoryPlaybookStore
from fieldops.handlers.registry import HandlerRegistry
from fieldops.utils.clock import SystemClock

class PlaybookService:
    def __init__(self, store: MemoryPlaybookStore, handlers: HandlerRegistry, clock: SystemClock) -> None:
        self._store = store
        self._handlers = handlers
        self._clock = clock

    async def register(self, pb: PlaybookDefinition) -> PlaybookDefinition:
        for t in pb.tasks:
            self._handlers.assert_known(t.handler)
        await self._store.save(pb)
        return pb

    async def get(self, pid: str) -> PlaybookDefinition:
        pb = await self._store.get(pid)
        if not pb:
            raise NotFoundError("Playbook", pid)
        return pb

    async def list(self) -> list[PlaybookDefinition]:
        return await self._store.list()
