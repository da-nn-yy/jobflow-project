from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class CaptureSignatureHandler(TaskHandler):
    name = "field.capture_signature"

    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        return self.ok({"signed_by": ctx.input.get("customer_name", "Customer"), "signature_hash": "sig_a1b2"})
