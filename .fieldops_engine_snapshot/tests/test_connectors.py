import asyncio
from fieldops.connectors.crm import CrmConnector

def test_crm_push():
    assert asyncio.run(CrmConnector().push({'workorder_id':'WO-1'}))['accepted']
