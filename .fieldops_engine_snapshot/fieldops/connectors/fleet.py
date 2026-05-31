from __future__ import annotations
from typing import Any

class FleetConnector:
    name = "fleet"
    async def push(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {"connector": self.name, "vehicles": payload.get("vehicle_ids", [])}
