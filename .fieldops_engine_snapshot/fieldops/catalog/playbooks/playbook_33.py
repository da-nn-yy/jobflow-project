"""Generated field-service playbook 33."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_33 = PlaybookDefinition(
    id="playbook_33",
    name="Regional playbook 33",
    description="Multi-step field workflow for electrical region 1.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="field.capture_signature", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="notify.customer_sms", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="inventory.sync", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="dispatch.assign_technician", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "1", "vertical": "electrical"},
)
