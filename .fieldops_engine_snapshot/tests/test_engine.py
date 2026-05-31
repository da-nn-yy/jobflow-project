import pytest
from fieldops.engine.state_machine import WorkflowStateMachine
from fieldops.engine.dag import DagPlanner
from fieldops.domain.enums import WorkflowState
from fieldops.domain.models import TaskDefinition

def test_state_machine_transitions():
    sm = WorkflowStateMachine()
    assert sm.transition(WorkflowState.PENDING, "start") == WorkflowState.RUNNING
    assert sm.transition(WorkflowState.RUNNING, "complete") == WorkflowState.COMPLETED

def test_invalid_transition():
    sm = WorkflowStateMachine()
    assert not sm.can_transition(WorkflowState.COMPLETED, "start")

def test_dag_levels():
    tasks = [
        TaskDefinition(id="a", name="A", handler="workorder.intake", timeout_ms=1000),
        TaskDefinition(id="b", name="B", handler="workorder.triage", timeout_ms=1000, depends_on=["a"]),
        TaskDefinition(id="c", name="C", handler="dispatch.assign_technician", timeout_ms=1000, depends_on=["b"]),
    ]
    levels = DagPlanner().plan_levels(tasks)
    assert levels[0] == ["a"]
    assert levels[-1] == ["c"]

def test_dag_cycle_raises():
    tasks = [
        TaskDefinition(id="x", name="X", handler="h", timeout_ms=1000, depends_on=["y"]),
        TaskDefinition(id="y", name="Y", handler="h", timeout_ms=1000, depends_on=["x"]),
    ]
    with pytest.raises(ValueError, match="cycle"):
        DagPlanner().plan_levels(tasks)
