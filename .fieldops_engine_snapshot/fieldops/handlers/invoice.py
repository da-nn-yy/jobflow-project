from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class GenerateInvoiceHandler(TaskHandler):
    name = "billing.generate_invoice"

    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        visit = ctx.prior_outputs.get("visit") or ctx.prior_outputs.get("execute") or {}
        labor = float(visit.get("labor_hours", 1.0)) * 95.0
        return self.ok({"invoice_id": f"INV-{ctx.run_id[-6:]}", "total_usd": round(labor + 120, 2)})
