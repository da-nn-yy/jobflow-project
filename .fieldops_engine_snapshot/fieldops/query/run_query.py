from fieldops.domain.models import WorkOrderRun

def filter_by_playbook(runs: list[WorkOrderRun], playbook_id: str) -> list[WorkOrderRun]:
    return [r for r in runs if r.playbook_id == playbook_id]
