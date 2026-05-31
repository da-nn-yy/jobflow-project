from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class WarrantyValidateHandler(TaskHandler):
    name = "warranty.validate"
    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        serial = str(ctx.input.get("serial", ""))
        if not serial:
            return self.fail("serial required")
        return self.ok({"serial": serial, "covered": len(serial) >= 6})
