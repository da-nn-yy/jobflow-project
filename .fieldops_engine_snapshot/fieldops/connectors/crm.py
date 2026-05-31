from __future__ import annotations
from typing import Any

class CrmConnector:
    name = "crm"
    async def push(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {"connector": self.name, "accepted": True, "id": payload.get("workorder_id", "unknown")}
