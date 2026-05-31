from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class RouteOptimizeHandler(TaskHandler):
    name = "dispatch.route_optimize"

    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        assign = ctx.prior_outputs.get("assign") or {}
        tech = assign.get("technician_id", "TECH-000")
        return self.ok({"technician_id": tech, "stops": 3, "miles": 42.5, "optimized": True})
