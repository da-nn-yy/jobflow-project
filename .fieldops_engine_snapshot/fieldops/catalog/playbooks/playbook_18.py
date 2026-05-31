"""Generated field-service playbook 18."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_18 = PlaybookDefinition(
    id="playbook_18",
    name="Regional playbook 18",
    description="Multi-step field workflow for electrical region 2.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="parts.ship", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="field.capture_signature", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="warranty.validate", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="workorder.intake", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "2", "vertical": "electrical"},
)
