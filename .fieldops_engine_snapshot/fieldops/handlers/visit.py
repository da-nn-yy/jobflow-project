from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class ExecuteVisitHandler(TaskHandler):
    name = "field.execute_visit"

    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        return self.ok({"visit_complete": True, "labor_hours": 2.5, "notes": "Replaced capacitor"})
