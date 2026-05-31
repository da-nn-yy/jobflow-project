import random
from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class IntakeHandler(TaskHandler):
    name = "workorder.intake"

    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        site = str(ctx.input.get("site_id", "SITE-001"))
        if not ctx.input.get("customer_name"):
            return self.fail("customer_name required")
        return self.ok({
            "site_id": site,
            "geocode": {"lat": 40.7 + random.random(), "lng": -74.0 + random.random()},
            "intake_id": f"IN-{ctx.run_id[-6:]}",
        })
