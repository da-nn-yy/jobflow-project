from __future__ import annotations
from typing import Any

class PartsVendorConnector:
    name = "parts_vendor"
    async def push(self, payload: dict[str, Any]) -> dict[str, Any]:
        return {"connector": self.name, "reservation_id": payload.get("sku", "SKU-000")}
