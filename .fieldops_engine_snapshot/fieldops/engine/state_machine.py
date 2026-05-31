from fieldops.domain.enums import WorkflowState

_TRANSITIONS: dict[WorkflowState, dict[str, WorkflowState]] = {
    WorkflowState.PENDING: {"start": WorkflowState.RUNNING},
    WorkflowState.RUNNING: {"complete": WorkflowState.COMPLETED, "fail": WorkflowState.FAILED, "wait": WorkflowState.WAITING},
    WorkflowState.WAITING: {"resume": WorkflowState.RUNNING, "fail": WorkflowState.FAILED},
    WorkflowState.FAILED: {"retry": WorkflowState.RUNNING},
}

class WorkflowStateMachine:
    def can_transition(self, current: WorkflowState, event: str) -> bool:
        return event in _TRANSITIONS.get(current, {})

    def transition(self, current: WorkflowState, event: str) -> WorkflowState:
        nxt = _TRANSITIONS.get(current, {}).get(event)
        if not nxt:
            raise ValueError(f"invalid transition {current} + {event}")
        return nxt
