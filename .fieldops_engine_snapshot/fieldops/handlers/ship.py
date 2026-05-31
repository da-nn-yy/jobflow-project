from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class PartsShipHandler(TaskHandler):
    name = "parts.ship"

    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        res = ctx.prior_outputs.get("reserve") or {}
        return self.ok({"tracking": f"1Z{ctx.run_id[-8:].upper()}", "reservation_id": res.get("reservation_id")})
