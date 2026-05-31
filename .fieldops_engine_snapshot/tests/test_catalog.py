import asyncio
from fieldops.storage.memory import MemoryPlaybookStore
from fieldops.catalog.loader import CatalogLoader

def test_catalog_loader_seed():
    async def run():
        store = MemoryPlaybookStore()
        loader = CatalogLoader(store)
        n = await loader.seed_if_empty()
        assert n >= 42
        assert await loader.seed_if_empty() == 0
    asyncio.run(run())

from fieldops.catalog.standard import STANDARD_PLAYBOOKS

def test_standard_playbooks_defined():
    assert any(p.id == "hvac_emergency" for p in STANDARD_PLAYBOOKS)

def test_playbook_pack_import():
    from fieldops.catalog.playbooks import BUILTIN_PLAYBOOKS
    assert len(BUILTIN_PLAYBOOKS) == 80
