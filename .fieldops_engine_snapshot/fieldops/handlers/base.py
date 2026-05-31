from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any

@dataclass
class HandlerContext:
    run_id: str
    task_id: str
    input: dict[str, Any]
    prior_outputs: dict[str, dict[str, Any]] = field(default_factory=dict)

@dataclass
class HandlerResult:
    success: bool
    output: dict[str, Any]
    error: str | None = None

class TaskHandler(ABC):
    name: str

    @abstractmethod
    async def execute(self, ctx: HandlerContext) -> HandlerResult:
        ...

    def ok(self, output: dict[str, Any]) -> HandlerResult:
        return HandlerResult(success=True, output=output)

    def fail(self, msg: str) -> HandlerResult:
        return HandlerResult(success=False, output={}, error=msg)
