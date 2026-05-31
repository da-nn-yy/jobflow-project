from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class InventorySyncHandler(TaskHandler):
    name = "inventory.sync"
    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        sku = str(ctx.input.get("sku", "GEN-001"))
        return self.ok({"sku": sku, "qty_on_hand": 12, "synced": True})
