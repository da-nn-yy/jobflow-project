"""Generated field-service playbook 67."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_67 = PlaybookDefinition(
    id="playbook_67",
    name="Regional playbook 67",
    description="Multi-step field workflow for plumbing region 3.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="dispatch.assign_technician", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="parts.reserve", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="field.capture_signature", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="warranty.validate", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "3", "vertical": "plumbing"},
)
