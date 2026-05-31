"""Generated field-service playbook 43."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_43 = PlaybookDefinition(
    id="playbook_43",
    name="Regional playbook 43",
    description="Multi-step field workflow for electrical region 11.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="parts.reserve", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="field.execute_visit", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="notify.customer_sms", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="inventory.sync", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "11", "vertical": "electrical"},
)
