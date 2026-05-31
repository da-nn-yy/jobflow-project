"""Internal domain event bus."""
from __future__ import annotations
from collections import defaultdict
from typing import Any, Callable

EventHandler = Callable[[str, dict[str, Any]], None]

class EventBus:
    def __init__(self) -> None:
        self._subs: dict[str, list[EventHandler]] = defaultdict(list)

    def subscribe(self, event: str, handler: EventHandler) -> None:
        self._subs[event].append(handler)

    def publish(self, event: str, payload: dict[str, Any]) -> None:
        for handler in self._subs.get(event, []):
            handler(event, payload)
