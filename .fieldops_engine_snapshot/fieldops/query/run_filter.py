from fieldops.domain.models import WorkOrderRun

def filter_by_state(runs: list[WorkOrderRun], state: str) -> list[WorkOrderRun]:
    return [r for r in runs if r.status.value == state]
