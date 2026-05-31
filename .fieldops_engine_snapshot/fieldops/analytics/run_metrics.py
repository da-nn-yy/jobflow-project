"""Aggregate run execution metrics."""
from __future__ import annotations
from fieldops.domain.models import WorkflowInstance
from fieldops.domain.enums import WorkflowState

def success_rate(workflows: list[WorkflowInstance]) -> float:
    if not workflows:
        return 0.0
    ok = sum(1 for w in workflows if w.state == WorkflowState.COMPLETED)
    return round(ok / len(workflows), 4)
