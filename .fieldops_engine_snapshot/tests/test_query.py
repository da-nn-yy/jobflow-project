from fieldops.query.run_query import filter_by_playbook
from fieldops.query.run_filter import filter_by_state
from fieldops.domain.models import WorkOrderRun
from fieldops.domain.enums import WorkflowState

def _run(pid, state):
    return WorkOrderRun(id='r1', playbook_id=pid, workflow_id='wf1', status=state, started_at='2026-01-01T00:00:00Z', trigger='api', input={})

def test_filters():
    runs = [_run('a', WorkflowState.RUNNING), _run('b', WorkflowState.COMPLETED)]
    assert len(filter_by_playbook(runs, 'a')) == 1
    assert len(filter_by_state(runs, 'completed')) == 1
