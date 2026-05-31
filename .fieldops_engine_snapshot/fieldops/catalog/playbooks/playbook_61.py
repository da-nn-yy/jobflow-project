"""Generated field-service playbook 61."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_61 = PlaybookDefinition(
    id="playbook_61",
    name="Regional playbook 61",
    description="Multi-step field workflow for hvac region 13.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="notify.customer_sms", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="survey.send", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="workorder.triage", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="parts.reserve", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "13", "vertical": "hvac"},
)
