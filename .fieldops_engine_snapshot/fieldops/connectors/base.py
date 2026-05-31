"""Connector base protocol."""
from __future__ import annotations
from typing import Any, Protocol

class Connector(Protocol):
    name: str
    async def push(self, payload: dict[str, Any]) -> dict[str, Any]: ...
