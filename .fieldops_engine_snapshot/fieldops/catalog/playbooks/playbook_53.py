"""Generated field-service playbook 53."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_53 = PlaybookDefinition(
    id="playbook_53",
    name="Regional playbook 53",
    description="Multi-step field workflow for electrical region 5.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="workorder.triage", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="dispatch.route_optimize", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="field.execute_visit", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="notify.customer_sms", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "5", "vertical": "electrical"},
)
