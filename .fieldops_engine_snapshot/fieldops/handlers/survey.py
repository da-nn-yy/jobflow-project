from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class SurveySendHandler(TaskHandler):
    name = "survey.send"
    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        email = ctx.input.get("email")
        if not email:
            return self.fail("email required")
        return self.ok({"survey_id": f"SV-{ctx.run_id[-6:]}", "channel": "email"})
