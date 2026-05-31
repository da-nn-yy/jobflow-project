import asyncio
from fieldops.handlers.warranty import WarrantyValidateHandler
from fieldops.handlers.survey import SurveySendHandler
from fieldops.handlers.inventory import InventorySyncHandler
from fieldops.handlers.base import HandlerContext

def _ctx(**inp):
    return HandlerContext(run_id='run-abc123', task_id='t1', input=inp)

def test_new_handlers():
    assert asyncio.run(WarrantyValidateHandler().execute(_ctx(serial='ABC123456'))).success
    assert asyncio.run(SurveySendHandler().execute(_ctx(email='a@b.com'))).success
    assert asyncio.run(InventorySyncHandler().execute(_ctx())).success
