import random
from fieldops.handlers.base import TaskHandler, HandlerContext, HandlerResult

class AssignTechnicianHandler(TaskHandler):
    name = "dispatch.assign_technician"

    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        tech_id = f"TECH-{random.randint(100,999)}"
        return self.ok({"technician_id": tech_id, "eta_minutes": random.randint(20, 90), "vehicle": "VAN-12"})
