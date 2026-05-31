from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class TriageHandler(TaskHandler):
    name = "workorder.triage"

    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        intake = ctx.prior_outputs.get("intake") or ctx.prior_outputs.get("step_0") or ctx.input
        priority = "P1" if ctx.input.get("emergency") else "P3"
        skills = ["hvac"] if ctx.input.get("trade") == "hvac" else ["general"]
        return self.ok({"priority": priority, "skills": skills, "sla_hours": 4 if priority == "P1" else 24})
