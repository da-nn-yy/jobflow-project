"""Generated field-service playbook 31."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_31 = PlaybookDefinition(
    id="playbook_31",
    name="Regional playbook 31",
    description="Multi-step field workflow for hvac region 15.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="parts.ship", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="field.capture_signature", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="warranty.validate", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="workorder.intake", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "15", "vertical": "hvac"},
)
