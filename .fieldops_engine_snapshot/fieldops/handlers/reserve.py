from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class PartsReserveHandler(TaskHandler):
    name = "parts.reserve"

    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        parts = ctx.input.get("parts") or [{"sku": "FILTER-01", "qty": 2}]
        return self.ok({"reservation_id": f"RES-{ctx.run_id[-5:]}", "parts": parts, "depot": "DEPOT-EAST"})
