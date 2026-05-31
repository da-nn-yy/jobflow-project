"""Generated field-service playbook 25."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_25 = PlaybookDefinition(
    id="playbook_25",
    name="Regional playbook 25",
    description="Multi-step field workflow for appliance region 9.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="inventory.sync", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="workorder.triage", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="parts.reserve", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="field.capture_signature", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "9", "vertical": "appliance"},
)
