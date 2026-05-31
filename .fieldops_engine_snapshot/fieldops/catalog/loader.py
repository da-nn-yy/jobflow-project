from fieldops.storage.memory import MemoryPlaybookStore
from fieldops.catalog.playbooks import BUILTIN_PLAYBOOKS
from fieldops.catalog.standard import STANDARD_PLAYBOOKS

class CatalogLoader:
    def __init__(self, store: MemoryPlaybookStore) -> None:
        self._store = store

    async def seed_if_empty(self) -> int:
        existing = await self._store.list()
        if existing:
            return 0
        catalog = STANDARD_PLAYBOOKS + BUILTIN_PLAYBOOKS
        for pb in catalog:
            await self._store.save(pb)
        return len(catalog)
