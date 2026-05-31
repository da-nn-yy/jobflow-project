"""Generated field-service playbook 38."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_38 = PlaybookDefinition(
    id="playbook_38",
    name="Regional playbook 38",
    description="Multi-step field workflow for electrical region 6.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="inventory.sync", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="workorder.triage", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="parts.reserve", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="field.capture_signature", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "6", "vertical": "electrical"},
)
