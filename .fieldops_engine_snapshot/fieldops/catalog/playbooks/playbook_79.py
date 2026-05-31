"""Generated field-service playbook 79."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_79 = PlaybookDefinition(
    id="playbook_79",
    name="Regional playbook 79",
    description="Multi-step field workflow for facilities region 15.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="workorder.triage", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="dispatch.route_optimize", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="field.execute_visit", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="notify.customer_sms", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "15", "vertical": "facilities"},
)
