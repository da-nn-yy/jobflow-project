"""Generated field-service playbook 56."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_56 = PlaybookDefinition(
    id="playbook_56",
    name="Regional playbook 56",
    description="Multi-step field workflow for hvac region 8.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="parts.reserve", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="field.execute_visit", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="notify.customer_sms", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="inventory.sync", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "8", "vertical": "hvac"},
)
