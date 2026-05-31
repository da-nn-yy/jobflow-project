from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class CustomerSmsHandler(TaskHandler):
    name = "notify.customer_sms"

    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        phone = str(ctx.input.get("phone", "+15550001111"))
        return self.ok({"phone": phone, "message_id": f"SMS-{ctx.run_id[-6:]}", "delivered": True})
